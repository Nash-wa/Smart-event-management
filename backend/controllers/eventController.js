const asyncHandler = require('express-async-handler');
const Event = require('../models/eventModel');
const { generateEventPlan } = require('../utils/planGenerator');
const { createNotification } = require('./notificationController');
const mongoose = require('mongoose');
const storage = require('../utils/storage');

// Helper to check if DB is connected
const isDbConnected = () => mongoose.connection.readyState === 1;

// @desc    Create a new event
// @route   POST /api/events
// @access  Private
const createEvent = asyncHandler(async (req, res) => {
    const {
        name, category, startDate, endDate, startTime, endTime,
        description, mode, venue, address, capacity, budget,
        features, selectedVendors, tags, bannerImage, isPublic, status,
        location, arPoints
    } = req.body;

    if (!name || !category || !startDate) {
        res.status(400);
        throw new Error('Please provide all required fields');
    }

    // Generate the plan
    const plan = generateEventPlan({ name, category, budget, startDate });
    const platformCommission = budget ? (Number(budget) * 0.1) : 0;

    if (!isDbConnected()) {
        const event = storage.create('events', {
            user: req.user._id,
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
            plan,
            platformCommission,
            status: status || 'pending',
            location,
            arPoints
        });
        return res.status(201).json(event);
    }

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
        features,
        selectedVendors,
        plan,
        platformCommission,
        tags,
        bannerImage,
        isPublic,
        status
    });

    // Notify the user
    try {
        await createNotification(
            req.user._id,
            'Event Created 🚀',
            `Your event "${name}" has been successfully created.`,
            'success',
            `/event-plan/${event._id}`
        );
    } catch (e) { }

    res.status(201).json(event);
});

// @desc    Get all events for logged in user (with Search & Filter)
// @route   GET /api/events
// @access  Private
const getEvents = asyncHandler(async (req, res) => {
    const { keyword, category, status, minBudget, maxBudget } = req.query;

    const query = { user: req.user._id };

    // Search by keyword in name or description
    if (keyword) {
        query.$or = [
            { name: { $regex: keyword, $options: 'i' } },
            { description: { $regex: keyword, $options: 'i' } }
        ];
    }

    // Filter by category
    if (category) {
        query.category = category;
    }

    // Filter by status
    if (status) {
        query.status = status;
    }

    // Filter by budget range
    if (minBudget || maxBudget) {
        query.budget = {};
        if (minBudget) query.budget.$gte = Number(minBudget);
        if (maxBudget) query.budget.$lte = Number(maxBudget);
    }

    // Filter by user and populate user details for "more details"
    const events = await Event.find(query)
        .populate('user', 'name email')
        .sort('-createdAt');

    res.json(events);
});

// @desc    Get all public events for browsing
// @route   GET /api/events/public
// @access  Public
const getPublicEvents = asyncHandler(async (req, res) => {
    const { category, keyword } = req.query;
    const query = { isPublic: true, status: 'published' };

    if (category) query.category = category;
    if (keyword) {
        query.$or = [
            { name: { $regex: keyword, $options: 'i' } },
            { description: { $regex: keyword, $options: 'i' } }
        ];
    }

    const events = await Event.find(query).populate('user', 'name email profilePic');
    res.json(events);
});

// @desc    Get event by ID
// @route   GET /api/events/:id
// @access  Private
const getEventById = asyncHandler(async (req, res) => {
    if (!isDbConnected()) {
        const event = storage.findById('events', req.params.id);
        if (event) {
            return res.json(event);
        } else {
            res.status(404);
            throw new Error('Event not found');
        }
    }

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

    // Merge HEAD fields if present in body
    if (req.body.arPoints) event.arPoints = req.body.arPoints;
    if (req.body.location) event.location = req.body.location;

    // Recalculate commission if budget changes
    if (req.body.budget) {
        req.body.platformCommission = Number(req.body.budget) * 0.1;
    }

    const updatedEvent = await Event.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
    }).populate('user', 'name email');

    res.status(200).json(updatedEvent);
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
    getPublicEventById,
    deleteEvent,
    getEventStats,
    getPublicEvents
};
