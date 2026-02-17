const asyncHandler = require('express-async-handler');
const Participant = require('../models/participantModel');
const Event = require('../models/eventModel');

// @desc    Add a participant to an event
// @route   POST /api/participants
// @access  Private
const addParticipant = asyncHandler(async (req, res) => {
    const { event, name, email, role } = req.body;

    if (!event || !name || !email) {
        res.status(400);
        throw new Error('Please provide all required fields');
    }

    // Verify event ownership
    const targetEvent = await Event.findById(event);
    if (!targetEvent || targetEvent.user.toString() !== req.user._id.toString()) {
        res.status(401);
        throw new Error('Unauthorized or event not found');
    }

    const participant = await Participant.create({
        event,
        name,
        email,
        role
    });

    res.status(201).json(participant);
});

// @desc    Get all participants for an event
// @route   GET /api/participants/:eventId
// @access  Private
const getParticipantsByEvent = asyncHandler(async (req, res) => {
    const participants = await Participant.find({ event: req.params.eventId });
    res.json(participants);
});

// @desc    Delete a participant
// @route   DELETE /api/participants/:id
// @access  Private
const deleteParticipant = asyncHandler(async (req, res) => {
    const participant = await Participant.findByIdAndDelete(req.params.id);
    if (participant) {
        res.json({ message: 'Participant removed' });
    } else {
        res.status(404);
        throw new Error('Participant not found');
    }
});

// @desc    Bulk add participants to an event
// @route   POST /api/participants/bulk
// @access  Private
const bulkAddParticipants = asyncHandler(async (req, res) => {
    const { eventId, participants } = req.body;

    if (!eventId || !participants || !Array.isArray(participants)) {
        res.status(400);
        throw new Error('Please provide eventId and participants array');
    }

    // Verify event ownership
    const targetEvent = await Event.findById(eventId);
    if (!targetEvent || targetEvent.user.toString() !== req.user._id.toString()) {
        res.status(401);
        throw new Error('Unauthorized or event not found');
    }

    const createdParticipants = await Participant.insertMany(
        participants.map(p => ({ ...p, event: eventId }))
    );

    res.status(201).json(createdParticipants);
});

// @desc    Public RSVP registration
// @route   POST /api/participants/rsvp
// @access  Public
const publicAddParticipant = asyncHandler(async (req, res) => {
    const { event, name, email } = req.body;

    if (!event || !name || !email) {
        res.status(400);
        throw new Error('Please provide all required fields');
    }

    // Verify event exists
    const targetEvent = await Event.findById(event);
    if (!targetEvent) {
        res.status(404);
        throw new Error('Event not found');
    }

    const participant = await Participant.create({
        event,
        name,
        email,
        role: 'Attendee',
        status: 'Confirmed' // Default to confirmed for self-RSVP
    });

    res.status(201).json(participant);
});

module.exports = {
    addParticipant,
    getParticipantsByEvent,
    deleteParticipant,
    bulkAddParticipants,
    publicAddParticipant
};
