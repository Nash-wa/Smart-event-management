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
        role,
        ticketId: `TKT-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
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
        participants.map(p => ({
            ...p,
            event: eventId,
            ticketId: `TKT-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
        }))
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
        status: 'Confirmed', // Default to confirmed for self-RSVP
        ticketId: `TKT-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
    });

    res.status(201).json(participant);
});

// @desc    Get participant by ticket ID
// @route   GET /api/participants/ticket/:ticketId
// @access  Public
const getTicketById = asyncHandler(async (req, res) => {
    const participant = await Participant.findOne({ ticketId: req.params.ticketId }).populate('event', 'title startDate location');

    if (!participant) {
        res.status(404);
        throw new Error('Ticket not found');
    }

    res.json(participant);
});

// @desc    Validate ticket and check-in
// @route   PUT /api/participants/validate/:ticketId
// @access  Private
const validateTicket = asyncHandler(async (req, res) => {
    const participant = await Participant.findOne({ ticketId: req.params.ticketId });

    if (!participant) {
        res.status(404);
        throw new Error('Invalid Ticket ID');
    }

    if (participant.checkInStatus === 'Checked In') {
        res.status(400);
        throw new Error('Ticket already validated / Checked In');
    }

    participant.checkInStatus = 'Checked In';
    await participant.save();

    res.json({
        success: true,
        message: `Welcome, ${participant.name}! Check-in successful.`,
        participant
    });
});

module.exports = {
    addParticipant,
    getParticipantsByEvent,
    deleteParticipant,
    bulkAddParticipants,
    publicAddParticipant,
    validateTicket,
    getTicketById
};
