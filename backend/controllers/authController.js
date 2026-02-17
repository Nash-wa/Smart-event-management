const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');

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

    const user = await User.create({
        name,
        email,
        password, // In a real app, hash this password!
        role: role === 'vendor' ? 'vendor' : 'user',
    });

    if (user) {
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
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
    console.log(`Login attempt for: ${email}`);

    const user = await User.findOne({ email });

    if (user && user.password === password) { // Simple check for now
        console.log(`Login successful for: ${email}`);
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
        });
    } else {
        console.log(`Login failed for: ${email}`);
        res.status(401);
        throw new Error('Invalid email or password');
    }
});

module.exports = { registerUser, loginUser };
