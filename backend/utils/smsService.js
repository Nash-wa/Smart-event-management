// Simple Twilio wrapper for sending SMS reminders
const twilio = require('twilio');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_FROM_NUMBER;

let client = null;
if (accountSid && authToken) {
    client = twilio(accountSid, authToken);
}

const sendSMS = async (to, body) => {
    if (!client) {
        throw new Error('Twilio not configured');
    }
    return client.messages.create({ from: fromNumber, to, body });
};

module.exports = { sendSMS };
