const asyncHandler = require('express-async-handler');
const Event = require('../models/eventModel');
const { generateEventPlan } = require('../utils/planGenerator');

// @desc    Create a new event
// @route   POST /api/events
// @access  Private
const createEvent = asyncHandler(async (req, res) => {
    const { name, startDate } = req.body;

    if (!name || !startDate) {
        res.status(400);
        throw new Error('Please provide all required fields (name, startDate)');
    }

    // Generate AI Plan automatically
    const aiPlan = generateEventPlan(req.body);

    const event = await Event.create({
        ...req.body,
        user: req.user._id,
        plan: aiPlan
    });

    if (event) {
        res.status(201).json(event);
    } else {
        res.status(400);
        throw new Error('Invalid event data');
    }
});

// @desc    Get all events for logged in user
// @route   GET /api/events
// @access  Private
const getEvents = asyncHandler(async (req, res) => {
    const events = await Event.find({ user: req.user._id });
    res.json(events);
});

// @desc    Get event by ID
// @route   GET /api/events/:id
// @access  Private
const getEventById = asyncHandler(async (req, res) => {
    const event = await Event.findById(req.params.id);

    if (event) {
        res.json(event);
    } else {
        res.status(404);
        throw new Error('Event not found');
    }
});

// @desc    Update event
// @route   PUT /api/events/:id
// @access  Private
const updateEvent = asyncHandler(async (req, res) => {
    const event = await Event.findById(req.params.id);

    if (event) {
        // Ensure only the owner can update the event
        if (event.user.toString() !== req.user._id.toString()) {
            res.status(401);
            throw new Error('User not authorized');
        }

        const updatedEvent = await Event.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        res.json(updatedEvent);
    } else {
        res.status(404);
        throw new Error('Event not found');
    }
});

// @desc    Get public event details (for RSVP)
// @route   GET /api/events/public/:id
// @access  Public
const getPublicEventById = asyncHandler(async (req, res) => {
    const event = await Event.findById(req.params.id).select('name startDate venue category capacity');

    if (event) {
        res.json(event);
    } else {
        res.status(404);
        throw new Error('Event not found');
    }
});

module.exports = {
    createEvent,
    getEvents,
    getEventById,
    updateEvent,
    getPublicEventById
};
