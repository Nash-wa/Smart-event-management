const asyncHandler = require('express-async-handler');
const Event = require('../models/eventModel');
const { generateEventPlan } = require('../utils/planGenerator');

// @desc    Create a new event
// @route   POST /api/events
// @access  Private
const createEvent = asyncHandler(async (req, res) => {
    const {
        name, description, category, mode, startDate, endDate,
        startTime, endTime, district, venue, address, capacity,
        budget, location, selectedVendors, features
    } = req.body;

    if (!name || !category || !startDate || !district) {
        res.status(400);
        throw new Error('Please provide all required fields including district');
    }

    const generatedPlan = generateEventPlan({ category, budget, startDate, capacity, venueType: venue });

    const event = await Event.create({
        user: req.user._id,
        name, description, category, mode, startDate, endDate,
        startTime, endTime, district, venue, address, capacity,
        budget, location, selectedVendors, features,
        nodes: [],
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
        if (event.user.toString() !== req.user._id.toString()) {
            res.status(401);
            throw new Error('User not authorized');
        }

        event.name = req.body.name || event.name;
        event.description = req.body.description !== undefined ? req.body.description : event.description;
        event.category = req.body.category || event.category;
        event.mode = req.body.mode || event.mode;
        event.startDate = req.body.startDate || event.startDate;
        event.endDate = req.body.endDate || event.endDate;
        event.startTime = req.body.startTime || event.startTime;
        event.endTime = req.body.endTime || event.endTime;
        event.district = req.body.district || event.district;
        event.venue = req.body.venue || event.venue;
        event.address = req.body.address || event.address;
        event.capacity = req.body.capacity || event.capacity;
        event.budget = req.body.budget || event.budget;
        event.location = req.body.location || event.location;
        event.selectedVendors = req.body.selectedVendors || event.selectedVendors;
        event.features = req.body.features || event.features;
        event.plan = req.body.plan || event.plan;
        event.readinessScore = req.body.readinessScore !== undefined ? req.body.readinessScore : event.readinessScore;

        // Handle nodes update
        if (req.body.nodes !== undefined) {
            event.nodes = req.body.nodes;
        }

        const updatedEvent = await event.save();
        res.json(updatedEvent);
    } else {
        res.status(404);
        throw new Error('Event not found');
    }
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

// @desc    Add or update a spatial node on an event
// @route   POST /api/events/:id/nodes
// @access  Private (event owner)
const addNode = asyncHandler(async (req, res) => {
    const event = await Event.findById(req.params.id);

    if (!event) {
        res.status(404);
        throw new Error('Event not found');
    }

    if (event.user.toString() !== req.user._id.toString()) {
        res.status(401);
        throw new Error('User not authorized');
    }

    const { nodeId, anchorType, latitude, longitude, instructions } = req.body;

    if (!nodeId || !anchorType || latitude === undefined || longitude === undefined) {
        res.status(400);
        throw new Error('nodeId, anchorType, latitude, and longitude are required');
    }

    // Check if a node with this nodeId already exists — if so update it
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

    if (event.user.toString() !== req.user._id.toString()) {
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
    getEventById,
    updateEvent,
    getPublicEventById,
    addNode,
    deleteNode,
    getPublicNodes
};
