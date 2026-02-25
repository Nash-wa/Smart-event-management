const mongoose = require('mongoose');

const reminderSchema = mongoose.Schema({
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    method: { type: String, enum: ['email', 'sms', 'push'], default: 'email' },
    // Optional: link to a specific milestone/task name
    taskName: { type: String },
    // Type of reminder: 'event' for event start, 'milestone' for plan tasks
    type: { type: String, enum: ['event', 'milestone'], default: 'event' },
    notifyAt: { type: Date, required: true },
    sent: { type: Boolean, default: false },
    sentAt: { type: Date }
}, {
    timestamps: true
});

module.exports = mongoose.model('Reminder', reminderSchema);
