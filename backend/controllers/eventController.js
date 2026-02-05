const asyncHandler = require('express-async-handler');
const Event = require('../models/eventModel');
const { generateEventPlan } = require('../utils/planGenerator');

// @desc    Create new event
// @route   POST /api/events
// @access  Private
const createEvent = asyncHandler(async (req, res) => {
    const {
        name, category, startDate, endDate, startTime, endTime,
        description, mode, venue, address, capacity, budget,
        features, selectedVendors
    } = req.body;

    // Simple validation
    if (!name || !category || !startDate) {
        res.status(400);
        throw new Error('Please fill in all required fields');
    }

    // Generate the plan
    const plan = generateEventPlan({ name, category, budget, startDate });

    const event = await Event.create({
        user: req.user._id, // Secured: uses authenticated user ID
        name,
        description,
        category,
        mode,
        startDate,
        endDate,
        startTime,
        endTime,
        venue,
        address,
        capacity,
        budget,
        features,
        selectedVendors,
        plan // Save the generated plan
    });

    res.status(201).json(event);
});

// @desc    Get all events for logged in user
// @route   GET /api/events
// @access  Private
const getEvents = asyncHandler(async (req, res) => {
    const events = await Event.find({ user: req.user._id }); // Filter by user
    res.json(events);
});

// @desc    Get event by ID
// @route   GET /api/events/:id
// @access  Private
const getEventById = asyncHandler(async (req, res) => {
    const event = await Event.findById(req.params.id);

    if (event) {
        // Security check: ensure event belongs to user
        if (event.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            res.status(401);
            throw new Error('User not authorized');
        }
        res.json(event);
    } else {
        res.status(404);
        throw new Error('Event not found');
    }
});

module.exports = { createEvent, getEvents, getEventById };
