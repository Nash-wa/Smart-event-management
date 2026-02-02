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
        user: req.body.user, // Ideally get from auth middleware
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

// @desc    Get all events
// @route   GET /api/events
// @access  Private
const getEvents = asyncHandler(async (req, res) => {
    const events = await Event.find({});
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

module.exports = { createEvent, getEvents, getEventById };
