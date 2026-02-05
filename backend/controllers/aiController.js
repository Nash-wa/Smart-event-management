const asyncHandler = require('express-async-handler');

// @desc    Analyze budget
// @route   GET /api/ai/analyze-budget
// @access  Public
const analyzeBudget = asyncHandler(async (req, res) => {
    const total = parseInt(req.query.total) || 50000;

    const allocation = {
        venue: total * 0.4,
        food: total * 0.3,
        decor: total * 0.2,
        media: total * 0.1
    };

    res.json({
        success: true,
        allocation,
        tip: "Based on this budget, we recommend local community halls."
    });
});

// @desc    Get recommendations based on budget
// @route   POST /api/ai/recommend
// @access  Public
const recommendServices = asyncHandler(async (req, res) => {
    const { budget } = req.body;
    const budgetVal = parseInt(budget);

    let services = [];

    if (budgetVal < 10000) {
        services = ["Community Hall", "Basic Catering", "Simple Decoration"];
    } else if (budgetVal < 30000) {
        services = ["Banquet Hall", "Buffet Catering", "Premium Decoration"];
    } else {
        services = ["Resort Venue", "Luxury Catering", "Theme Decoration"];
    }

    res.json({ recommended_services: services });
});

module.exports = { analyzeBudget, recommendServices };
