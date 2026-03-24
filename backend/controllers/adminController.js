const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');
const Event = require('../models/eventModel');
const Vendor = require('../models/vendorModel');
const Category = require('../models/categoryModel');
const Booking = require('../models/bookingModel');
const { sendBroadcastEmail } = require('../utils/emailService');

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = asyncHandler(async (req, res) => {
    const users = await User.find({}).select('-password');
    
    // Efficiently add event count to each user
    const usersWithCounts = await Promise.all(users.map(async (user) => {
        const eventCount = await Event.countDocuments({ user: user._id });
        return { ...user.toObject(), eventCount };
    }));
    
    res.json(usersWithCounts);
});

// @desc    Get all vendors with booking counts
// @route   GET /api/admin/vendors
// @access  Private/Admin
const getAllVendors = asyncHandler(async (req, res) => {
    const vendors = await Vendor.find({}).populate('owner', 'name email');
    
    const vendorsWithCounts = await Promise.all(vendors.map(async (vendor) => {
        const bookings = await Booking.find({ vendor: vendor._id });
        const bookingCount = bookings.length;
        const totalRevenue = bookings
            .filter(b => b.status === 'confirmed')
            .reduce((sum, b) => sum + (b.totalPrice || 0), 0);
            
        return { ...vendor.toObject(), bookingCount, totalRevenue };
    }));
    
    res.json(vendorsWithCounts);
});

// @desc    Get bookings for a specific vendor
// @route   GET /api/admin/vendors/:id/bookings
// @access  Private/Admin
const getVendorBookings = asyncHandler(async (req, res) => {
    const bookings = await Booking.find({ vendor: req.params.id })
        .populate('user', 'name email')
        .populate('event', 'name startDate');
    res.json(bookings);
});

// @desc    Get events for a specific user
// @route   GET /api/admin/users/:id/events
// @access  Private/Admin
const getUserEvents = asyncHandler(async (req, res) => {
    const events = await Event.find({ user: req.params.id }).populate('user', 'name email');
    res.json(events);
});

// @desc    Get platform stats
// @route   GET /api/admin/stats
// @access  Private/Admin
const getStats = asyncHandler(async (req, res) => {
    const userCount = await User.countDocuments({});
    const eventCount = await Event.countDocuments({});
    const vendorCount = await Vendor.countDocuments({ isApproved: true });
    const pendingCount = await Vendor.countDocuments({ isApproved: false });

    const bookings = await Booking.find({ status: 'confirmed' });
    const totalRevenue = bookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);
 
    res.json({
        users: userCount,
        events: eventCount,
        vendors: vendorCount,
        pending: pendingCount,
        totalRevenue
    });
});

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (user) {
        if (user.role === 'admin') {
            res.status(400);
            throw new Error('Cannot delete admin user');
        }
        await user.deleteOne();
        res.json({ message: 'User removed' });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Get all event categories
// @route   GET /api/admin/categories
// @access  Private/Admin
const getCategories = asyncHandler(async (req, res) => {
    const categories = await Category.find({}).sort({ createdAt: -1 });
    res.json(categories);
});

// @desc    Add new event category
// @route   POST /api/admin/categories
// @access  Private/Admin
const addCategory = asyncHandler(async (req, res) => {
    const { name, description } = req.body;
    if (!name) {
        res.status(400);
        throw new Error('Category name is required');
    }

    const exists = await Category.findOne({ name });
    if (exists) {
        res.status(400);
        throw new Error('Category already exists');
    }

    const category = await Category.create({ name, description });
    res.status(201).json(category);
});

// @desc    Delete event category
// @route   DELETE /api/admin/categories/:id
// @access  Private/Admin
const deleteCategory = asyncHandler(async (req, res) => {
    const category = await Category.findById(req.params.id);
    if (!category) {
        res.status(404);
        throw new Error('Category not found');
    }
    await category.deleteOne();
    res.json({ message: 'Category removed' });
});

// @desc    Broadcast a message to all registered users
// @route   POST /api/admin/broadcast
// @access  Private/Admin
const broadcastMessage = asyncHandler(async (req, res) => {
    const { subject, message, html } = req.body;
    if (!subject || (!message && !html)) {
        res.status(400);
        throw new Error('Subject and message/html required');
    }

    const users = await User.find({}).select('email name');
    const emails = users.map(u => u.email).filter(Boolean);

    // Basic HTML wrapper if plain message provided
    const htmlBody = html || `<div style="font-family: Arial, sans-serif;">${message}</div>`;

    // Send in batches to avoid very large single mail 'to' lists
    const batchSize = 80;
    for (let i = 0; i < emails.length; i += batchSize) {
        const batch = emails.slice(i, i + batchSize);
        // eslint-disable-next-line no-await-in-loop
        await sendBroadcastEmail(batch, subject, htmlBody);
    }

    res.json({ message: `Broadcast sent to ${emails.length} users (in batches).` });
});

module.exports = {
    getAllUsers,
    getStats,
    deleteUser,
    getUserEvents,
    getCategories,
    addCategory,
    deleteCategory,
    getAllVendors,
    getVendorBookings,
    broadcastMessage
};

