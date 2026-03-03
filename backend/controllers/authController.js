const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');
const generateToken = require('../utils/generateToken');
const { sendOTPEmail, sendPasswordResetEmail } = require('../utils/emailService');

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const allowedDomains = [
    'gmail.com', 'outlook.com', 'yahoo.com', 'icloud.com', 'hotmail.com',
    'protonmail.com', 'zoho.com', 'yandex.com', 'mail.com', 'aol.com',
    'gmx.com', 'fastmail.com'
];

// ─── Register ─────────────────────────────────────────────────────────────────
// @route POST /api/auth/register
// @access Public
const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
        res.status(400);
        throw new Error('Name, email, and password are required.');
    }

    // Domain whitelist
    const emailDomain = email.split('@')[1]?.toLowerCase();
    if (!allowedDomains.includes(emailDomain)) {
        res.status(400);
        throw new Error('Please use a valid email provider (Gmail, Outlook, Yahoo, iCloud, etc.)');
    }

    // Check if already registered and verified
    const existingUser = await User.findOne({ email });
    if (existingUser && existingUser.isVerified) {
        res.status(400);
        throw new Error('An account with this email already exists. Please log in.');
    }

    const otpCode = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 min

    console.log(`[TESTING] OTP for ${email}: ${otpCode}`);

    if (existingUser && !existingUser.isVerified) {
        // Resend OTP to unverified account
        existingUser.name = name;
        existingUser.password = password;
        existingUser.otpCode = otpCode;
        existingUser.otpExpires = otpExpires;
        await existingUser.save();
    } else {
        // Create new unverified user
        await User.create({
            name,
            email,
            password,
            role: role || 'user',
            isVerified: false,
            otpCode,
            otpExpires
        });
    }

    // Send OTP email
    try {
        await sendOTPEmail(email, otpCode, name);
    } catch (emailErr) {
        console.error('Email send failed:', emailErr.message);
        res.status(500);
        throw new Error('Failed to send verification email. Please check email configuration.');
    }

    res.status(201).json({
        message: 'OTP sent to your email. Please verify to complete registration.',
        email
    });
});

// ─── Verify OTP (Registration) ────────────────────────────────────────────────
// @route POST /api/auth/verify-otp
// @access Public
const verifyOTP = asyncHandler(async (req, res) => {
    const { email, otpCode } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
        res.status(404);
        throw new Error('No account found with this email.');
    }

    if (user.isVerified) {
        res.status(400);
        throw new Error('This account is already verified. Please log in.');
    }

    if (user.otpCode !== otpCode) {
        res.status(400);
        throw new Error('Invalid OTP. Please check the code in your email.');
    }

    if (user.otpExpires < Date.now()) {
        res.status(400);
        throw new Error('OTP has expired. Please register again to get a new code.');
    }

    user.isVerified = true;
    user.otpCode = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
        message: 'Email verified successfully! Welcome aboard.'
    });
});

// ─── Login ────────────────────────────────────────────────────────────────────
// @route POST /api/auth/login
// @access Public
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
        res.status(401);
        throw new Error('No account found with this email.');
    }

    if (!user.isVerified) {
        res.status(403);
        throw new Error('Please verify your email before logging in. Check your inbox for the OTP.');
    }

    if (!(await user.matchPassword(password))) {
        res.status(401);
        throw new Error('Incorrect password.');
    }

    res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id)
    });
});

// ─── Forgot Password — Send OTP ───────────────────────────────────────────────
// @route POST /api/auth/forgot-password
// @access Public
const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;

    if (!email) {
        res.status(400);
        throw new Error('Email is required.');
    }

    const user = await User.findOne({ email });

    // Always respond the same to avoid email enumeration
    if (!user || !user.isVerified) {
        return res.json({ message: 'If an account exists with that email, a reset code has been sent.' });
    }

    const otpCode = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    console.log(`[TESTING] Reset OTP for ${email}: ${otpCode}`);

    user.otpCode = otpCode;
    user.otpExpires = otpExpires;
    await user.save();

    try {
        await sendPasswordResetEmail(email, otpCode, user.name);
    } catch (emailErr) {
        console.error('Reset email failed:', emailErr.message);
        res.status(500);
        throw new Error('Failed to send reset email. Please check email configuration.');
    }

    res.json({ message: 'If an account exists with that email, a reset code has been sent.' });
});

// ─── Verify Reset OTP ─────────────────────────────────────────────────────────
// @route POST /api/auth/verify-reset-otp
// @access Public
const verifyResetOTP = asyncHandler(async (req, res) => {
    const { email, otpCode } = req.body;

    const user = await User.findOne({ email });

    if (!user || user.otpCode !== otpCode || user.otpExpires < Date.now()) {
        res.status(400);
        throw new Error('Invalid or expired reset code. Please request a new one.');
    }

    res.json({ valid: true, message: 'OTP verified. You may now set a new password.' });
});

// ─── Reset Password ───────────────────────────────────────────────────────────
// @route POST /api/auth/reset-password
// @access Public
const resetPassword = asyncHandler(async (req, res) => {
    const { email, otpCode, newPassword } = req.body;

    if (!email || !otpCode || !newPassword) {
        res.status(400);
        throw new Error('Email, OTP, and new password are required.');
    }

    if (newPassword.length < 6) {
        res.status(400);
        throw new Error('Password must be at least 6 characters.');
    }

    const user = await User.findOne({ email });

    if (!user || user.otpCode !== otpCode || user.otpExpires < Date.now()) {
        res.status(400);
        throw new Error('Invalid or expired reset code.');
    }

    user.password = newPassword;
    user.otpCode = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.json({ message: 'Password reset successful. You can now log in with your new password.' });
});

module.exports = {
    registerUser,
    loginUser,
    verifyOTP,
    forgotPassword,
    verifyResetOTP,
    resetPassword
};
