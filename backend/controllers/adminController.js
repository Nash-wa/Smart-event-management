const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');
const Event = require('../models/eventModel');

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = asyncHandler(async (req, res) => {
    const users = await User.find({});
    res.json(users);
});

// @desc    Get admin stats
// @route   GET /api/admin/stats
// @access  Private/Admin
const getStats = asyncHandler(async (req, res) => {
    const userCount = await User.countDocuments();
    const eventCount = await Event.countDocuments();

    // Count vendors specifically
    const vendorCount = await User.countDocuments({ role: 'vendor' });

    res.json({
        userCount,
        eventCount,
        vendorCount
    });
});

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (user) {
        await user.deleteOne();
        res.json({ message: 'User removed' });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

module.exports = {
    getAllUsers,
    getStats,
    deleteUser
};
