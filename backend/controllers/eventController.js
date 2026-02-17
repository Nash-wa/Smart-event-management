const asyncHandler = require('express-async-handler');
const Event = require('../models/eventModel');
const { generateEventPlan } = require('../utils/planGenerator');

// @desc    Create a new event
// @route   POST /api/events
// @access  Private
const createEvent = asyncHandler(async (req, res) => {
    const { name, description, category, startDate, venue, budget, capacity, address, location, arPoints } = req.body;

    if (!name || !category || !startDate) {
        res.status(400);
        throw new Error('Please provide all required fields');
    }

    // Use our plan generator to create the initial state
    const generatedPlan = generateEventPlan({ category, budget, startDate, capacity, venueType: venue });

    const event = await Event.create({
        user: req.user._id,
        name,
        description,
        category,
        startDate,
        venue,
        budget,
        capacity,
        address,
        location,
        arPoints,
        plan: generatedPlan
    });

    res.status(201).json(event);
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

        event.name = req.body.name || event.name;
        event.description = req.body.description || event.description;
        event.category = req.body.category || event.category;
        event.venue = req.body.venue || event.venue;
        event.budget = req.body.budget || event.budget;
        event.plan = req.body.plan || event.plan;
        event.location = req.body.location || event.location;
        event.arPoints = req.body.arPoints || event.arPoints;
        event.readinessScore = req.body.readinessScore || event.readinessScore;

        const updatedEvent = await event.save();
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
