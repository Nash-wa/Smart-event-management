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
        name, description, category, mode, startDate, endDate,
        startTime, endTime, district, venue, address, capacity,
        budget, location, arPoints, selectedVendors, features,
        tags, bannerImage, isPublic, status
    } = req.body;

    if (!name || !category || !startDate) {
        res.status(400);
        throw new Error('Please provide all required fields');
    }

    // Generate the plan
    const plan = generateEventPlan({ name, category, budget, startDate, capacity, venueType: venue });
    const platformCommission = budget ? (Number(budget) * 0.1) : 0;

    if (!isDbConnected()) {
        const eventData = {
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
            nodes: arPoints || []
        };
        const event = storage.create('events', eventData);
        return res.status(201).json(event);
    }

    const event = await Event.create({
        user: req.user._id,
        name,
        description,
        category,
        mode,
        startDate,
        endDate,
        startTime,
        endTime,
        district,
        venue,
        address,
        capacity,
        budget,
        location,
        nodes: arPoints || [],
        selectedVendors,
        features,
        plan,
        platformCommission,
        tags,
        bannerImage,
        isPublic,
        status: status || 'pending'
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

    if (keyword) {
        query.$or = [
            { name: { $regex: keyword, $options: 'i' } },
            { description: { $regex: keyword, $options: 'i' } }
        ];
    }

    if (category) query.category = category;
    if (status) query.status = status;

    if (minBudget || maxBudget) {
        query.budget = {};
        if (minBudget) query.budget.$gte = Number(minBudget);
        if (maxBudget) query.budget.$lte = Number(maxBudget);
    }

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
    const query = { isPublic: true, status: { $ne: 'cancelled' } };

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

    if (event.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        res.status(401);
        throw new Error('User not authorized');
    }

    // Update fields
    if (req.body.name) event.name = req.body.name;
    if (req.body.description !== undefined) event.description = req.body.description;
    if (req.body.category) event.category = req.body.category;
    if (req.body.mode) event.mode = req.body.mode;
    if (req.body.startDate) event.startDate = req.body.startDate;
    if (req.body.endDate) event.endDate = req.body.endDate;
    if (req.body.startTime) event.startTime = req.body.startTime;
    if (req.body.endTime) event.endTime = req.body.endTime;
    if (req.body.district) event.district = req.body.district;
    if (req.body.venue) event.venue = req.body.venue;
    if (req.body.address) event.address = req.body.address;
    if (req.body.capacity) event.capacity = req.body.capacity;
    if (req.body.budget) {
        event.budget = req.body.budget;
        event.platformCommission = Number(req.body.budget) * 0.1;
    }
    if (req.body.location) event.location = req.body.location;
    if (req.body.nodes !== undefined) event.nodes = req.body.nodes;
    if (req.body.arPoints !== undefined) event.nodes = req.body.arPoints; // handle both naming conventions
    if (req.body.selectedVendors) event.selectedVendors = req.body.selectedVendors;
    if (req.body.features) event.features = req.body.features;
    if (req.body.tags) event.tags = req.body.tags;
    if (req.body.bannerImage) event.bannerImage = req.body.bannerImage;
    if (req.body.isPublic !== undefined) event.isPublic = req.body.isPublic;
    if (req.body.status) event.status = req.body.status;
    if (req.body.readinessScore !== undefined) event.readinessScore = req.body.readinessScore;
    if (req.body.plan) event.plan = req.body.plan;

    const updatedEvent = await event.save();
    res.json(updatedEvent);
});

// @desc    Get public event details (for RSVP / Guest AR)
// @route   GET /api/events/public/:id
// @access  Public
const getPublicEventById = asyncHandler(async (req, res) => {
    const event = await Event.findById(req.params.id)
        .select('name startDate venue category capacity nodes location');

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

    if (event.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
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

// @desc    Add or update a spatial node on an event
// @route   POST /api/events/:id/nodes
// @access  Private (event owner)
const addNode = asyncHandler(async (req, res) => {
    const event = await Event.findById(req.params.id);

    if (!event) {
        res.status(404);
        throw new Error('Event not found');
    }

    if (event.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        res.status(401);
        throw new Error('User not authorized');
    }

    const { nodeId, anchorType, latitude, longitude, instructions } = req.body;

    if (!nodeId || !anchorType || latitude === undefined || longitude === undefined) {
        res.status(400);
        throw new Error('nodeId, anchorType, latitude, and longitude are required');
    }

    const existingIndex = event.nodes.findIndex(n => n.nodeId === nodeId);
    if (existingIndex >= 0) {
        event.nodes[existingIndex] = { nodeId, anchorType, latitude, longitude, instructions };
    } else {
        event.nodes.push({ nodeId, anchorType, latitude, longitude, instructions });
    }

    const updatedEvent = await event.save();
    res.json(updatedEvent.nodes);
});

// @desc    Delete a spatial node from an event
// @route   DELETE /api/events/:id/nodes/:nodeId
// @access  Private (event owner)
const deleteNode = asyncHandler(async (req, res) => {
    const event = await Event.findById(req.params.id);

    if (!event) {
        res.status(404);
        throw new Error('Event not found');
    }

    if (event.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        res.status(401);
        throw new Error('User not authorized');
    }

    event.nodes = event.nodes.filter(n => n.nodeId !== req.params.nodeId);
    const updatedEvent = await event.save();
    res.json(updatedEvent.nodes);
});

// @desc    Get public nodes for guest AR (by eventId)
// @route   GET /api/events/public/:id/nodes
// @access  Public
const getPublicNodes = asyncHandler(async (req, res) => {
    const event = await Event.findById(req.params.id)
        .select('name venue nodes');

    if (!event) {
        res.status(404);
        throw new Error('Event not found');
    }

    res.json({
        eventName: event.name,
        venue: event.venue,
        nodes: event.nodes || []
    });
});

module.exports = {
    createEvent,
    getEvents,
    getPublicEvents,
    getEventById,
    updateEvent,
    getPublicEventById,
    deleteEvent,
    getEventStats,
    addNode,
    deleteNode,
    getPublicNodes
};
