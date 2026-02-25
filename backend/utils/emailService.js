const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

/**
 * Send OTP email for registration verification
 */
const sendOTPEmail = async (toEmail, otpCode, userName) => {
    const mailOptions = {
        from: `"Smart Event" <${process.env.EMAIL_USER}>`,
        to: toEmail,
        subject: '🔐 Verify Your Email — Smart Event',
        html: `
        <div style="font-family: 'Helvetica Neue', Arial, sans-serif; background:#050505; color:#fff; padding:40px; border-radius:20px; max-width:520px; margin:auto;">
            <div style="text-align:center; margin-bottom:32px;">
                <h1 style="font-size:28px; font-weight:900; letter-spacing:-1px; margin:0;">Smart Event</h1>
                <p style="color:#666; font-size:12px; text-transform:uppercase; letter-spacing:3px; margin-top:4px;">Email Verification</p>
            </div>
            <p style="font-size:16px; color:#ccc; margin-bottom:8px;">Hi <strong style="color:#fff;">${userName}</strong>,</p>
            <p style="font-size:14px; color:#888; line-height:1.6; margin-bottom:32px;">
                Use the code below to verify your email address. This code is valid for <strong style="color:#fff;">10 minutes</strong>.
            </p>
            <div style="background:#111; border:1px solid #222; border-radius:16px; padding:32px; text-align:center; margin-bottom:32px;">
                <p style="font-size:13px; color:#666; text-transform:uppercase; letter-spacing:4px; margin:0 0 12px;">Your OTP Code</p>
                <div style="font-size:48px; font-weight:900; letter-spacing:16px; color:#3b82f6; font-family:monospace;">${otpCode}</div>
            </div>
            <p style="font-size:12px; color:#444; text-align:center;">
                If you did not request this, you can safely ignore this email. Do not share this code with anyone.
            </p>
        </div>
        `
    };

    await transporter.sendMail(mailOptions);
};

/**
 * Send password reset OTP email
 */
const sendPasswordResetEmail = async (toEmail, otpCode, userName) => {
    const mailOptions = {
        from: `"Smart Event" <${process.env.EMAIL_USER}>`,
        to: toEmail,
        subject: '🔑 Reset Your Password — Smart Event',
        html: `
        <div style="font-family: 'Helvetica Neue', Arial, sans-serif; background:#050505; color:#fff; padding:40px; border-radius:20px; max-width:520px; margin:auto;">
            <div style="text-align:center; margin-bottom:32px;">
                <h1 style="font-size:28px; font-weight:900; letter-spacing:-1px; margin:0;">Smart Event</h1>
                <p style="color:#666; font-size:12px; text-transform:uppercase; letter-spacing:3px; margin-top:4px;">Password Reset</p>
            </div>
            <p style="font-size:16px; color:#ccc; margin-bottom:8px;">Hi <strong style="color:#fff;">${userName}</strong>,</p>
            <p style="font-size:14px; color:#888; line-height:1.6; margin-bottom:32px;">
                We received a request to reset your password. Use the code below — it expires in <strong style="color:#fff;">10 minutes</strong>.
            </p>
            <div style="background:#111; border:1px solid #222; border-radius:16px; padding:32px; text-align:center; margin-bottom:32px;">
                <p style="font-size:13px; color:#666; text-transform:uppercase; letter-spacing:4px; margin:0 0 12px;">Reset Code</p>
                <div style="font-size:48px; font-weight:900; letter-spacing:16px; color:#ef4444; font-family:monospace;">${otpCode}</div>
            </div>
            <p style="font-size:12px; color:#444; text-align:center;">
                If you didn't request a password reset, your account is safe — just ignore this email.
            </p>
        </div>
        `
    };

    await transporter.sendMail(mailOptions);
};

module.exports = { sendOTPEmail, sendPasswordResetEmail };
