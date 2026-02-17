const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');
const Event = require('../models/eventModel');
const Vendor = require('../models/vendorModel');

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (Admin)
const getAllUsers = asyncHandler(async (req, res) => {
    const users = await User.find({}).select('-password');
    res.json(users);
});

// @desc    Get platform stats
// @route   GET /api/admin/stats
// @access  Private (Admin)
const getStats = asyncHandler(async (req, res) => {
    const userCount = await User.countDocuments();
    const eventCount = await Event.countDocuments();
    const vendorCount = await Vendor.countDocuments({ isApproved: true });
    const pendingCount = await Vendor.countDocuments({ isApproved: false });

    res.json({
        users: userCount,
        events: eventCount,
        vendors: vendorCount,
        pending: pendingCount
    });
});

// @desc    Delete a user
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin)
const deleteUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (user) {
        if (user.role === 'admin') {
            res.status(400);
            throw new Error('Cannot delete another admin');
        }
        await user.deleteOne();
        res.json({ message: 'User removed' });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

module.exports = { getAllUsers, getStats, deleteUser };
