const asyncHandler = require('express-async-handler');
const Registration = require('../models/registrationModel');
const Event = require('../models/eventModel');

// @desc    Register for an event
// @route   POST /api/registrations
// @access  Private
const registerForEvent = asyncHandler(async (req, res) => {
    const { eventId } = req.body;

    const event = await Event.findById(eventId);
    if (!event) {
        res.status(404);
        throw new Error('Event not found');
    }

    const alreadyRegistered = await Registration.findOne({ event: eventId, user: req.user._id });
    if (alreadyRegistered) {
        res.status(400);
        throw new Error('Already registered for this event');
    }

    const ticketId = `TKT-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

    const registration = await Registration.create({
        event: eventId,
        user: req.user._id,
        ticketId
    });

    event.attendeeCount = (event.attendeeCount || 0) + 1;
    await event.save();

    res.status(201).json(registration);
});

// @desc    Get my registrations
// @route   GET /api/registrations/my
// @access  Private
const getMyRegistrations = asyncHandler(async (req, res) => {
    const registrations = await Registration.find({ user: req.user._id }).populate('event');
    res.json(registrations);
});

// @desc    Check-in attendee
// @route   PUT /api/registrations/:id/checkin
// @access  Private
const checkInAttendee = asyncHandler(async (req, res) => {
    const registration = await Registration.findById(req.params.id).populate('event');

    if (!registration) {
        res.status(404);
        throw new Error('Registration not found');
    }

    // Check if user is event owner or admin
    if (registration.event.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        res.status(401);
        throw new Error('Not authorized to check-in');
    }

    registration.checkedIn = true;
    const updatedRegistration = await registration.save();
    res.json(updatedRegistration);
});

module.exports = { registerForEvent, getMyRegistrations, checkInAttendee };
