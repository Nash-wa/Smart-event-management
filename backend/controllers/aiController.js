const asyncHandler = require('express-async-handler');
const Event = require('../models/eventModel');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'AIza-dummy-key');

// @desc    Analyze event budget and give recommendations using Gemini Pro
// @route   GET /api/ai/analyze-budget (Used internally or for specific queries, but analyze is POST generally)
// @route   POST /api/ai/analyze
// @access  Private
const analyzeBudget = asyncHandler(async (req, res) => {
    // Check both query and body for eventId to be safe
    const eventId = req.query.eventId || req.body.eventId;

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
    const capacity = event.capacity || 100;

    try {
        if (!process.env.GEMINI_API_KEY) {
            console.warn("GEMINI_API_KEY is missing! Using fallback logic.");
            return fallbackAnalyze(event, res);
        }

        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const prompt = `
You are an expert Kerala event planner. 
Event Name: ${event.name}
Category: ${event.category}
Budget: ₹${budget}
Current Spent: ₹${used}
Guests: ${capacity}
District: ${event.district || 'Kerala'}

Provide a detailed budget and risk analysis with the following sections formatted exactly like this:
BUDGET ADVICE:
[1-2 sentences of high level analysis of their current spend vs total budget]
 
TOP RISKS:
- [Risk 1]
- [Risk 2]
- [Risk 3]

VENDOR PRIORITY:
1. [Vendor Category] - [Reason]
2. [Vendor Category] - [Reason]
3. [Vendor Category] - [Reason]
`;

        const result = await model.generateContent(prompt);
        const adviceText = result.response.text();

        return res.json({
            eventId,
            eventName: event.name,
            budget,
            used,
            remaining,
            status: (used / budget > 0.9) ? 'Critical' : (used / budget > 0.7) ? 'Warning' : 'On Track',
            advice: adviceText
        });

    } catch (error) {
        console.error("Gemini API Error:", error);
        return fallbackAnalyze(event, res);
    }
});

// Fallback logic if Gemini fails
const fallbackAnalyze = (event, res) => {
    const budget = event.budget || 0;
    const used = event.usedBudget || 0;
    const remaining = Math.max(0, budget - used);
    const usedPercent = budget > 0 ? ((used / budget) * 100).toFixed(1) : 0;

    let status = 'On Track';
    let advice = 'Your budget is well managed. Focus on priorities like catering and venue.';

    if (usedPercent > 90) {
        status = 'Critical';
        advice = 'You have used over 90% of your budget. Avoid adding new expenses immediately.';
    } else if (usedPercent > 70) {
        status = 'Warning';
        advice = 'You have used over 70% of your budget. Review remaining expenses carefully.';
    } else if (usedPercent > 50) {
        status = 'Moderate';
        advice = 'Half your budget is spent. Keep an eye on upcoming costs like decor and tech.';
    }

    return res.json({
        eventId: event._id,
        eventName: event.name,
        budget,
        used,
        remaining,
        usedPercent: parseFloat(usedPercent),
        status,
        advice: `BUDGET ADVICE: ${advice}\n\nTOP RISKS:\n- Running out of funds before final day\n- Unexpected vendor price surges\n- Hidden taxation charges\n\nVENDOR PRIORITY:\n1. Catering\n2. Venue\n3. Photography`
    });
};

// @desc    Recommend services
// @route   POST /api/ai/recommend
// @access  Private
const recommendServices = asyncHandler(async (req, res) => {
    const { category, budget } = req.body;
    let recommendations = [];

    if (category === 'Wedding') {
        recommendations.push(
            { service: 'Photography', suggestedBudget: budget * 0.2, priority: 'High' },
            { service: 'Catering', suggestedBudget: budget * 0.35, priority: 'High' },
            { service: 'Decoration', suggestedBudget: budget * 0.2, priority: 'Medium' },
            { service: 'Venue', suggestedBudget: budget * 0.15, priority: 'High' }
        );
    } else {
        recommendations.push(
            { service: 'Venue', suggestedBudget: budget * 0.3, priority: 'High' },
            { service: 'Catering', suggestedBudget: budget * 0.3, priority: 'High' },
            { service: 'Photography', suggestedBudget: budget * 0.2, priority: 'Medium' }
        );
    }

    res.json({ category, budget, recommendations });
});

// @desc    Chatbot Endpoint
// @route   POST /api/ai/chat
// @access  Public
const handleChat = asyncHandler(async (req, res) => {
    const { message, eventContext } = req.body;
    if (!message) return res.status(400).json({ message: 'Message is required' });

    try {
        if (!process.env.GEMINI_API_KEY) {
            return res.json({ response: "I'm offline right now (API Key missing). But I can still give you some basic tips from the dashboard!" });
        }

        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const contextStr = eventContext
            ? `Current Event Context: Name: ${eventContext.name}, District: ${eventContext.district}, Budget: ${eventContext.budget}`
            : 'General Platform Query.';

        const prompt = `You are an AI assistant for "Smart Event Management" platform in Kerala, India. 
${contextStr}
User Message: "${message}"

Answer concisely and helpfully in 1-3 sentences. Be friendly and keep the context of Kerala events if applicable.`;

        const result = await model.generateContent(prompt);
        res.json({ response: result.response.text() });
    } catch (error) {
        console.error("Gemini Chat Error:", error);
        res.status(500).json({ response: "I'm having trouble connecting to my brain right now. Please try again later." });
    }
});

module.exports = { analyzeBudget, recommendServices, handleChat };
