const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');
const generateToken = require('../utils/generateToken');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password, role } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
    }

    // Email Domain Validation (Whitelist major providers)
    const allowedDomains = ['gmail.com', 'outlook.com', 'yahoo.com', 'icloud.com', 'hotmail.com'];
    const emailDomain = email.split('@')[1];

    if (!allowedDomains.includes(emailDomain?.toLowerCase())) {
        res.status(400);
        throw new Error('Please use a standard email provider (Gmail, Outlook, Yahoo, or iCloud). Disposable emails are strictly prohibited.');
    }

    // Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    const user = await User.create({
        name,
        email,
        password,
        role: role || 'user',
        isVerified: true // OTP disabled by default
    });

    if (user) {
        // OTP generation logic removed for simplicity as per user request

        res.status(201).json({
            _id: user._id,
            email: user.email,
            token: generateToken(user._id),
            message: 'Registration successful.'
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
});

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id),
        });
    } else {
        res.status(401);
        throw new Error('Invalid email or password');
    }
});

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
// @access  Public
const verifyOTP = asyncHandler(async (req, res) => {
    const { email, otpCode } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    if (user.isVerified) {
        res.status(400);
        throw new Error('User already verified');
    }

    if (user.otpCode !== otpCode || user.otpExpires < Date.now()) {
        res.status(400);
        throw new Error('Invalid or expired OTP');
    }

    user.isVerified = true;
    user.otpCode = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.json({
        success: true,
        message: 'Email verified successfully',
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id)
    });
});

module.exports = {
    registerUser,
    loginUser,
    verifyOTP
};
