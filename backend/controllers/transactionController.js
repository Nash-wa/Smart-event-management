const asyncHandler = require('express-async-handler');

// @desc    Process payment
// @route   POST /api/transactions/pay
// @access  Private
const processPayment = asyncHandler(async (req, res) => {
    const { amount, eventId } = req.body;
    // Mock payment processing
    res.status(201).json({
        success: true,
        transactionId: `TXN_${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        amount,
        eventId
    });
});

// @desc    Get platform earnings
// @route   GET /api/transactions/earnings
// @access  Private/Admin
const getStats = asyncHandler(async (req, res) => {
    res.json({
        totalEarnings: 45000,
        pending: 1200
    });
});

module.exports = {
    processPayment,
    getEarnings: getStats, // alias as per routes
};
