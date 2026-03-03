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

    // Create default reminders for the event owner: 7d, 1d, 1h before startDate (if in future)
    try {
        const Reminder = require('../models/reminderModel');
        const schedules = [
            { label: '7d', offsetMs: 7 * 24 * 60 * 60 * 1000 },
            { label: '1d', offsetMs: 24 * 60 * 60 * 1000 },
            { label: '1h', offsetMs: 60 * 60 * 1000 }
        ];
        const start = new Date(startDate);
        const remindersToCreate = [];
        for (const s of schedules) {
            const notifyAt = new Date(start.getTime() - s.offsetMs);
            if (notifyAt > new Date()) {
                remindersToCreate.push({ event: event._id, user: req.user._id, method: 'email', notifyAt });
            }
        }
        if (remindersToCreate.length > 0) {
            await Reminder.insertMany(remindersToCreate);
        }
    } catch (err) {
        console.error('Failed to create reminders for event', err);
    }

    // Create milestone reminders based on generated plan timeline
    try {
        const Reminder = require('../models/reminderModel');
        const timeline = generatedPlan.timeline || [];
        const remindersToCreate = [];

        for (const item of timeline) {
            if (item.status && item.status.toLowerCase() === 'completed') continue;
            // prefer ISO deadline if present
            const dl = item.deadlineISO ? new Date(item.deadlineISO) : new Date(item.deadline);
            if (isNaN(dl.getTime())) continue;

            // schedules: 7 days before, 1 day before, on-deadline (to warn if still pending)
            const offsets = [7 * 24 * 60 * 60 * 1000, 24 * 60 * 60 * 1000, 0];
            for (const off of offsets) {
                const notifyAt = new Date(dl.getTime() - off);
                // Only schedule reminders in the future
                if (notifyAt > new Date()) {
                    remindersToCreate.push({
                        event: event._id,
                        user: req.user._id,
                        method: 'email',
                        type: 'milestone',
                        taskName: item.task,
                        notifyAt
                    });
                }
            }
        }

        if (remindersToCreate.length > 0) {
            await Reminder.insertMany(remindersToCreate);
        }
    } catch (err) {
        console.error('Failed to create milestone reminders', err);
    }

    res.status(201).json(event);
});

// @desc    Get all events for logged in user
// @route   GET /api/events
// @access  Private
const getEvents = asyncHandler(async (req, res) => {
    // Admins should see all events; normal users only see their own
    let events;
    if (req.user && req.user.role === 'admin') {
        events = await Event.find({});
    } else {
        events = await Event.find({ user: req.user._id });
    }

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
        const previousPlan = event.plan ? JSON.parse(JSON.stringify(event.plan)) : null;
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

        // Handle arNodes update
        if (req.body.arNodes !== undefined) {
            event.arNodes = req.body.arNodes;
        }

        const updatedEvent = await event.save();

        // If plan timeline updated, and some tasks moved to Completed, mark related reminders as sent
        try {
            const Reminder = require('../models/reminderModel');
            const newPlan = updatedEvent.plan || {};
            const oldTimeline = previousPlan?.timeline || [];
            const newTimeline = newPlan.timeline || [];

            // Build map of old statuses by task name
            const oldStatusMap = {};
            for (const t of oldTimeline) {
                if (t && t.task) oldStatusMap[t.task] = (t.status || '').toLowerCase();
            }

            const tasksCompleted = [];
            for (const t of newTimeline) {
                const name = t.task;
                const newStatus = (t.status || '').toLowerCase();
                const oldStatus = oldStatusMap[name] || 'pending';
                if (oldStatus !== 'completed' && newStatus === 'completed') tasksCompleted.push(name);
            }

            if (tasksCompleted.length > 0) {
                // mark matching milestone reminders for this event and user as sent
                await Reminder.updateMany({ event: event._id, user: req.user._id, type: 'milestone', taskName: { $in: tasksCompleted }, sent: false }, { $set: { sent: true, sentAt: new Date() } });
            }
        } catch (err) {
            console.error('Failed to cleanup reminders after task update', err);
        }

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

// @desc    Get AR nodes for an event
// @route   GET /api/events/:id/arnodes
// @access  Public
const getArNodes = asyncHandler(async (req, res) => {
    const event = await Event.findById(req.params.id);

    if (event) {
        res.json(event.arNodes || []);
    } else {
        res.status(404);
        throw new Error('Event not found');
    }
});


// @desc    Get event readiness score
// @route   GET /api/events/:id/readiness
// @access  Private
const getReadinessScore = asyncHandler(async (req, res) => {
    const event = await Event.findById(req.params.id).populate('nodes');

    if (!event) {
        res.status(404);
        throw new Error('Event not found');
    }

    // Check authorization (event owner or admin)
    if (event.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        res.status(403);
        throw new Error('Not authorized to view readiness for this event');
    }

    let score = 0;
    const metrics = {};

    // Check if venue booked (+20%)
    metrics.venueBooked = !!event.venue;
    if (event.venue) score += 20;

    // Check if at least 2 services booked (+20%)
    const Booking = require('../models/bookingModel');
    const servicesCount = await Booking.countDocuments({
        event: req.params.id,
        status: { $in: ['pending', 'confirmed', 'completed'] }
    });
    metrics.servicesCount = servicesCount;
    metrics.servicesBooked = servicesCount >= 2;
    if (servicesCount >= 2) score += 20;

    // Check if budget configured (+20%)
    metrics.budgetConfigured = (event.budget && event.budget > 0);
    if (event.budget && event.budget > 0) score += 20;

    // Check if AR nodes exist (+20%)
    const nodesCount = (event.nodes ? event.nodes.length : 0) + (event.arNodes ? event.arNodes.length : 0);
    metrics.arNodesCount = nodesCount;
    metrics.arNodesExist = nodesCount > 0;
    if (nodesCount > 0) score += 20;

    // Check Guest Count
    const Participant = require('../models/participantModel');
    const guestCount = await Participant.countDocuments({ event: req.params.id });
    metrics.guestCount = guestCount;

    // Check if reminder configured (+20%)
    try {
        const Reminder = require('../models/reminderModel');
        const reminderExists = await Reminder.findOne({ event: req.params.id });
        metrics.reminderConfigured = !!reminderExists;
        if (reminderExists) score += 20;
    } catch (err) {
        console.error('Could not check reminder status', err);
        metrics.reminderConfigured = false;
    }

    metrics.readinessScore = Math.min(score, 100); // Cap at 100%

    res.status(200).json({
        eventId: event._id,
        eventName: event.name,
        readinessScore: metrics.readinessScore,
        metrics
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
    getPublicNodes,
    getReadinessScore,
    getArNodes
};
