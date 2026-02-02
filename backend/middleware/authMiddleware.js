const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');

// Simple middleware to check if user is admin
const adminOnly = asyncHandler(async (req, res, next) => {
    // In a real app, we check the token. 
    // For now, we'll look for a header 'x-user-role' for testing purposes
    const role = req.headers['x-user-role'];

    if (role === 'admin') {
        next();
    } else {
        res.status(401);
        throw new Error('Not authorized as an admin');
    }
});

// Simple middleware to check if user is vendor
const vendorOnly = asyncHandler(async (req, res, next) => {
    const role = req.headers['x-user-role'];

    if (role === 'vendor' || role === 'admin') {
        next();
    } else {
        res.status(401);
        throw new Error('Not authorized as a vendor');
    }
});

module.exports = { adminOnly, vendorOnly };
