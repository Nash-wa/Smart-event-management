const asyncHandler = require('express-async-handler');
const Registration = require('../models/registrationModel');
const Event = require('../models/eventModel');
const { createNotification } = require('./notificationController');

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

    // Check if already registered
    const alreadyRegistered = await Registration.findOne({ event: eventId, user: req.user._id });
    if (alreadyRegistered) {
        res.status(400);
        throw new Error('You are already registered for this event');
    }

    // Generate Ticket ID
    const ticketId = `TKT-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

    const registration = await Registration.create({
        event: eventId,
        user: req.user._id,
        ticketId
    });

    // Increment attendee count
    event.attendeeCount = (event.attendeeCount || 0) + 1;
    await event.save();

    // Notify user
    try {
        await createNotification(
            req.user._id,
            'Registration Confirmed! 🎫',
            `Your ticket for "${event.name}" is confirmed. Ticket ID: ${ticketId}`,
            'success',
            `/events/${eventId}`
        );
    } catch (e) { }

    res.status(201).json(registration);
});

// @desc    Get user's registered events
// @route   GET /api/registrations/me
// @access  Private
const getMyRegistrations = asyncHandler(async (req, res) => {
    const registrations = await Registration.find({ user: req.user._id }).populate('event');
    res.json(registrations);
});

// @desc    Get all attendees for an event (Admin or Organizer)
// @route   GET /api/registrations/event/:eventId
// @access  Private
const getEventAttendees = asyncHandler(async (req, res) => {
    const event = await Event.findById(req.params.eventId);
    if (!event) {
        res.status(404);
        throw new Error('Event not found');
    }

    // Security: Only owner or admin
    if (event.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        res.status(401);
        throw new Error('Not authorized');
    }

    const attendees = await Registration.find({ event: req.params.eventId }).populate('user', 'name email');
    res.json(attendees);
});

// @desc    Check-in an attendee
// @route   PUT /api/registrations/:id/checkin
// @access  Private
const checkInAttendee = asyncHandler(async (req, res) => {
    const registration = await Registration.findById(req.params.id).populate('event');

    if (registration) {
        // Security: Only organizer or admin
        if (registration.event.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            res.status(401);
            throw new Error('Not authorized to check-in');
        }

        registration.checkedIn = true;
        const updatedRegistration = await registration.save();
        res.json(updatedRegistration);
    } else {
        res.status(404);
        throw new Error('Registration not found');
    }
});

module.exports = { registerForEvent, getMyRegistrations, getEventAttendees, checkInAttendee };
