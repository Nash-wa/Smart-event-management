const asyncHandler = require('express-async-handler');
const Event = require('../models/eventModel');

// @desc    Process a simulated payment and split commission
// @route   POST /api/transactions/pay
// @access  Private
const processPayment = asyncHandler(async (req, res) => {
    const { eventId, amount } = req.body;

    const event = await Event.findById(eventId);

    if (event) {
        // Business Logic: 10% Platform Commission
        const commission = amount * 0.10;
        const vendorShare = amount - commission;

        // Update event financial status
        event.totalPaid += amount;
        event.platformCommission += commission;

        if (event.totalPaid >= event.budget) {
            event.paymentStatus = 'paid';
        } else if (event.totalPaid > 0) {
            event.paymentStatus = 'partial';
        }

        const updatedEvent = await event.save();

        res.json({
            success: true,
            totalAmount: amount,
            vendorReceived: vendorShare,
            adminCommission: commission,
            currentEventStatus: updatedEvent.paymentStatus
        });
    } else {
        res.status(404);
        throw new Error('Event not found');
    }
});

// @desc    Get total platform earnings (Admin Only)
// @route   GET /api/transactions/earnings
// @access  Private/Admin
const getEarnings = asyncHandler(async (req, res) => {
    const events = await Event.find({});
    const totalEarnings = events.reduce((acc, event) => acc + (event.platformCommission || 0), 0);
    const totalVolume = events.reduce((acc, event) => acc + (event.totalPaid || 0), 0);

    res.json({
        totalFeesCollected: totalEarnings,
        totalTransactionVolume: totalVolume,
        eventCount: events.length
    });
});

module.exports = { processPayment, getEarnings };
