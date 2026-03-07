const asyncHandler = require('express-async-handler');
const Event = require('../models/eventModel');

// @desc    Analyze event budget and give recommendations
// @route   GET /api/ai/analyze-budget
// @access  Private
const analyzeBudget = asyncHandler(async (req, res) => {
    const { eventId } = req.query;

    if (!eventId) {
        return res.status(400).json({ message: 'eventId is required' });
    }

    const event = await Event.findById(eventId);
    if (!event) {
        return res.status(404).json({ message: 'Event not found' });
    }

    const budget = event.budget || 0;
    const used = event.usedBudget || 0;
    const remaining = Math.max(0, budget - used);
    const usedPercent = budget > 0 ? ((used / budget) * 100).toFixed(1) : 0;

    let status = 'On Track';
    let advice = 'Your budget is well managed.';

    if (usedPercent > 90) {
        status = 'Critical';
        advice = 'You have used over 90% of your budget. Avoid adding new expenses.';
    } else if (usedPercent > 70) {
        status = 'Warning';
        advice = 'You have used over 70% of your budget. Review remaining expenses carefully.';
    } else if (usedPercent > 50) {
        status = 'Moderate';
        advice = 'Half your budget is spent. Keep an eye on upcoming costs.';
    }

    res.json({
        eventId,
        eventName: event.name,
        budget,
        used,
        remaining,
        usedPercent: parseFloat(usedPercent),
        status,
        advice
    });
});

// @desc    Recommend services based on event category & budget
// @route   POST /api/ai/recommend
// @access  Private
const recommendServices = asyncHandler(async (req, res) => {
    const { category, budget } = req.body;

    const recommendations = [];

    if (category === 'Wedding') {
        recommendations.push(
            { service: 'Photography', suggestedBudget: budget * 0.2, priority: 'High' },
            { service: 'Catering', suggestedBudget: budget * 0.35, priority: 'High' },
            { service: 'Decoration', suggestedBudget: budget * 0.2, priority: 'Medium' },
            { service: 'Music/DJ', suggestedBudget: budget * 0.1, priority: 'Medium' },
            { service: 'Venue', suggestedBudget: budget * 0.15, priority: 'High' }
        );
    } else if (category === 'Corporate' || category === 'Conference') {
        recommendations.push(
            { service: 'Venue', suggestedBudget: budget * 0.4, priority: 'High' },
            { service: 'Catering', suggestedBudget: budget * 0.3, priority: 'High' },
            { service: 'Photography', suggestedBudget: budget * 0.15, priority: 'Medium' },
            { service: 'Decoration', suggestedBudget: budget * 0.15, priority: 'Low' }
        );
    } else {
        recommendations.push(
            { service: 'Venue', suggestedBudget: budget * 0.3, priority: 'High' },
            { service: 'Catering', suggestedBudget: budget * 0.3, priority: 'High' },
            { service: 'Photography', suggestedBudget: budget * 0.2, priority: 'Medium' },
            { service: 'Music/DJ', suggestedBudget: budget * 0.2, priority: 'Medium' }
        );
    }

    res.json({ category, budget, recommendations });
});

module.exports = { analyzeBudget, recommendServices };
