const asyncHandler = require('express-async-handler');
const Message = require('../models/messageModel');
const Event = require('../models/eventModel');

// @desc    Broadcast an announcement
// @route   POST /api/messages/broadcast
// @access  Private
const broadcastMessage = asyncHandler(async (req, res) => {
    const { event: eventId, text, type, target } = req.body;

    if (!eventId || !text) {
        res.status(400);
        throw new Error('Event ID and message text are required');
    }

    // Verify event ownership
    const event = await Event.findById(eventId);
    if (!event || (event.user.toString() !== req.user._id.toString() && req.user.role !== 'admin')) {
        res.status(401);
        throw new Error('Unauthorized to broadcast for this event');
    }

    const message = await Message.create({
        event: eventId,
        sender: req.user._id,
        text,
        type: type || 'Info',
        target: target || 'All'
    });

    res.status(201).json(message);
});

// @desc    Get announcements for an event
// @route   GET /api/messages/:eventId
// @access  Public
const getMessagesByEvent = asyncHandler(async (req, res) => {
    const messages = await Message.find({ event: req.params.eventId })
        .sort('-createdAt')
        .limit(10);
    res.json(messages);
});

// @desc    Get announcements for events user is attending
// @route   GET /api/messages/feed
// @access  Private
const getUserMessages = asyncHandler(async (req, res) => {
    const userEmail = req.user.email;

    // Find event IDs where user is a participant
    const Participant = require('../models/participantModel');
    const participations = await Participant.find({ email: userEmail });
    const eventIds = participations.map(p => p.event);

    const messages = await Message.find({ event: { $in: eventIds } })
        .populate('event', 'name')
        .sort('-createdAt')
        .limit(15);

    res.json(messages);
});

module.exports = {
    broadcastMessage,
    getMessagesByEvent,
    getUserMessages
};
