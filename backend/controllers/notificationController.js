const asyncHandler = require('express-async-handler');
const Notification = require('../models/notificationModel');

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
const getNotifications = asyncHandler(async (req, res) => {
    const notifications = await Notification.find({ user: req.user._id }).sort('-createdAt');
    res.json(notifications);
});

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
const markAsRead = asyncHandler(async (req, res) => {
    const notification = await Notification.findById(req.params.id);

    if (notification) {
        if (notification.user.toString() !== req.user._id.toString()) {
            res.status(401);
            throw new Error('Not authorized');
        }
        notification.isRead = true;
        await notification.save();
        res.json({ success: true });
    } else {
        res.status(404);
        throw new Error('Notification not found');
    }
});

// @desc    Create a notification (Internal helper)
const createNotification = async (userId, title, message, type = 'info', link = '') => {
    try {
        await Notification.create({
            user: userId,
            title,
            message,
            type,
            link
        });
    } catch (error) {
        console.error('Notification Error:', error);
    }
};

module.exports = { getNotifications, markAsRead, createNotification };
