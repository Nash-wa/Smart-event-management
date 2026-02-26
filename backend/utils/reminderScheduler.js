const Reminder = require('../models/reminderModel');
const User = require('../models/userModel');
const Event = require('../models/eventModel');
const { sendBroadcastEmail } = require('./emailService');
const { sendSMS } = require('./smsService');

const checkAndSendReminders = async () => {
    const now = new Date();
    // find pending reminders due in the past or now
    const reminders = await Reminder.find({ sent: false, notifyAt: { $lte: now } }).limit(200).populate('user event');
    for (const r of reminders) {
        try {
            const user = r.user;
            const event = r.event;
            if (!user || !event) {
                // if associated records missing, mark as sent to avoid retries
                r.sent = true;
                r.sentAt = new Date();
                await r.save();
                continue;
            }

            if (r.type === 'milestone' && r.taskName) {
                // Find task in event plan
                const task = (event.plan?.timeline || []).find(t => t.task === r.taskName);
                if (task && (task.status || '').toLowerCase() === 'completed') {
                    // Nothing to send; mark reminder as sent
                    r.sent = true;
                    r.sentAt = new Date();
                    await r.save();
                    continue;
                }

                // Determine if this is an on-deadline (overdue) notification
                const nowTs = new Date().getTime();
                const notifyTs = new Date(r.notifyAt).getTime();
                const isDeadline = Math.abs(nowTs - notifyTs) < 1000 * 60 * 5; // within 5 minutes

                const subj = isDeadline ? `Overdue: ${r.taskName}` : `Reminder: ${r.taskName}`;
                const body = isDeadline
                    ? `<div style="font-family: Arial, sans-serif;">Hi ${user.name || ''},<p>The task <strong>${r.taskName}</strong> for event <strong>${event.name}</strong> is due now or overdue. Please complete it as soon as possible.</p></div>`
                    : `<div style="font-family: Arial, sans-serif;">Hi ${user.name || ''},<p>This is a reminder that the task <strong>${r.taskName}</strong> for event <strong>${event.name}</strong> has a deadline on ${new Date(task?.deadlineISO || task?.deadline || event.startDate).toLocaleString()}.</p></div>`;

                if (r.method === 'email') {
                    await sendBroadcastEmail(user.email, subj, body);
                } else if (r.method === 'sms') {
                    if (user.phone) {
                        await sendSMS(user.phone, `${isDeadline ? 'OVERDUE:' : 'Reminder:'} ${r.taskName} — ${event.name} at ${new Date(task?.deadlineISO || task?.deadline || event.startDate).toLocaleString()}`);
                    }
                } else if (r.method === 'push') {
                    console.warn('Push reminder requested but not implemented for user', user._id);
                }

                r.sent = true;
                r.sentAt = new Date();
                await r.save();
                continue;
            }

            // Fallback: general event reminder
            const subject = `Reminder: ${event.name} is coming up`;
            const html = `<div style="font-family: Arial, sans-serif;">Hello ${user.name || ''},<p>This is a reminder that <strong>${event.name}</strong> is scheduled for ${new Date(event.startDate).toLocaleString()} at ${event.venue || 'the venue'}.</p></div>`;

            if (r.method === 'email') {
                await sendBroadcastEmail(user.email, subject, html);
            } else if (r.method === 'sms') {
                if (user.phone) {
                    await sendSMS(user.phone, `${event.name} starts at ${new Date(event.startDate).toLocaleString()}`);
                }
            } else if (r.method === 'push') {
                console.warn('Push reminder requested but not implemented for user', user._id);
            }

            r.sent = true;
            r.sentAt = new Date();
            await r.save();
        } catch (err) {
            console.error('Error sending reminder', err);
        }
    }
};

let intervalHandle = null;
const startScheduler = () => {
    if (intervalHandle) return;
    // run every minute
    intervalHandle = setInterval(() => {
        checkAndSendReminders().catch(err => console.error('Reminder scheduler error', err));
    }, 60 * 1000);
    // run an immediate pass on startup
    checkAndSendReminders().catch(err => console.error('Reminder scheduler error', err));
    console.log('Reminder scheduler started');
};

module.exports = { startScheduler, checkAndSendReminders };
