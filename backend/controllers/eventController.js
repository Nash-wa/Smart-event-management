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

    if (endDate && new Date(endDate) < new Date(startDate)) {
        res.status(400);
        throw new Error('End date cannot be before start date');
    }

    if (budget && budget < 0) {
        res.status(400);
        throw new Error('Budget cannot be negative');
    }

    // Generate the plan
    const plan = generateEventPlan({ name, category, budget, startDate });

    // Calculate platform commission (10%)
    const platformCommission = budget ? (Number(budget) * 0.1) : 0;

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
        plan, // Save the generated plan
        platformCommission // Auto-calculate commission
    });

    res.status(201).json(event);
});

// @desc    Get all events for logged in user
// @route   GET /api/events
// @access  Private
const getEvents = asyncHandler(async (req, res) => {
    // Filter by user and populate user details for "more details"
    const events = await Event.find({ user: req.user._id })
        .populate('user', 'name email')
        .sort('-createdAt');

    res.json(events);
});

// @desc    Get event by ID
// @route   GET /api/events/:id
// @access  Private
const getEventById = asyncHandler(async (req, res) => {
    const event = await Event.findById(req.params.id).populate('user', 'name email');

    if (event) {
        // Security check: ensure event belongs to user
        if (event.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            res.status(401);
            throw new Error('User not authorized');
        }
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

    if (!event) {
        res.status(404);
        throw new Error('Event not found');
    }

    // Check for user
    if (!req.user) {
        res.status(401);
        throw new Error('User not found');
    }

    // Make sure the logged in user matches the event user
    if (event.user.toString() !== req.user.id && req.user.role !== 'admin') {
        res.status(401);
        throw new Error('User not authorized');
    }

    // Recalculate commission if budget changes
    if (req.body.budget) {
        req.body.platformCommission = Number(req.body.budget) * 0.1;
    }

    const updatedEvent = await Event.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
    }).populate('user', 'name email');

    res.status(200).json(updatedEvent);
});

// @desc    Delete event
// @route   DELETE /api/events/:id
// @access  Private
const deleteEvent = asyncHandler(async (req, res) => {
    const event = await Event.findById(req.params.id);

    if (!event) {
        res.status(404);
        throw new Error('Event not found');
    }

    // Check for user
    if (!req.user) {
        res.status(401);
        throw new Error('User not found');
    }

    // Make sure the logged in user matches the event user
    if (event.user.toString() !== req.user.id && req.user.role !== 'admin') {
        res.status(401);
        throw new Error('User not authorized');
    }

    await event.deleteOne();

    res.status(200).json({ id: req.params.id });
});

// @desc    Get event statistics for the user
// @route   GET /api/events/stats/me
// @access  Private
const getEventStats = asyncHandler(async (req, res) => {
    const events = await Event.find({ user: req.user._id });

    const stats = {
        totalEvents: events.length,
        totalBudget: events.reduce((sum, evt) => sum + (evt.budget || 0), 0),
        upcomingEvents: events.filter(evt => new Date(evt.startDate) >= new Date()).length,
        completedEvents: events.filter(evt => new Date(evt.startDate) < new Date()).length,
        categories: {}
    };

    events.forEach(evt => {
        stats.categories[evt.category] = (stats.categories[evt.category] || 0) + 1;
    });

    res.json(stats);
});

module.exports = {
    createEvent,
    getEvents,
    getEventById,
    updateEvent,
    deleteEvent,
    getEventStats
};
