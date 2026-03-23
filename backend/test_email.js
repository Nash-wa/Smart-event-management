require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

async function testEmail() {
    try {
        console.log('Sending from:', process.env.EMAIL_USER);
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER,
            subject: 'Test Email',
            text: 'Hello world'
        });
        console.log('Success!');
    } catch (e) {
        console.error('Error:', e);
    }
}

testEmail();
