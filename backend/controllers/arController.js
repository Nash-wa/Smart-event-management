const asyncHandler = require('express-async-handler');
const ARLayout = require('../models/arLayoutModel');

// @desc    Save AR layout for an event
// @route   POST /api/ar-layout
// @access  Private
const saveARLayout = asyncHandler(async (req, res) => {
    const { event_id, layoutData } = req.body;

    if (!event_id || !layoutData) {
        res.status(400);
        throw new Error('Please provide event ID and layout data');
    }

    // Verify event ownership
    const Event = require('../models/eventModel');
    const event = await Event.findById(event_id);
    if (!event) {
        res.status(404);
        throw new Error('Event not found');
    }

    if (event.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        res.status(403);
        throw new Error('Not authorized to modify this event layout');
    }

    const layout = await ARLayout.findOneAndUpdate(
        { event: event_id },
        { layoutData },
        { new: true, upsert: true }
    );

    res.status(201).json(layout);
});

// @desc    Get AR layout for an event
// @route   GET /api/ar-layout/:event_id
// @access  Private
const getARLayout = asyncHandler(async (req, res) => {
    const layout = await ARLayout.findOne({ event: req.params.event_id });

    if (layout) {
        res.json(layout);
    } else {
        res.status(404);
        throw new Error('Layout not found');
    }
});

module.exports = { saveARLayout, getARLayout };
