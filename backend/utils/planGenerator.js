/**
 * Generates a structured plan for an event based on its category, budget, and timing.
 */
const generateEventPlan = (eventData) => {
    const { category, budget, startDate, name } = eventData;
    const eventDate = new Date(startDate);

    // 1. Timeline Generation (relative to event date)
    const timeline = [
        {
            task: "Initial Planning & Goal Setting",
            date: new Date(new Date(eventDate).setDate(eventDate.getDate() - 30)).toDateString(),
            status: "Completed",
            description: "Define event objectives and establish a rough budget."
        },
        {
            task: "Venue & Key Vendors Booking",
            date: new Date(new Date(eventDate).setDate(eventDate.getDate() - 25)).toDateString(),
            status: "In Progress",
            description: "Secure the location and major services."
        },
        {
            task: "Guest List & Invitations",
            date: new Date(new Date(eventDate).setDate(eventDate.getDate() - 15)).toDateString(),
            status: "Pending",
            description: "Send out digital or physical invites."
        },
        {
            task: "Final Logistics Review",
            date: new Date(new Date(eventDate).setDate(eventDate.getDate() - 3)).toDateString(),
            status: "Pending",
            description: "Confirm all timings and vendor arrivals."
        },
        {
            task: "Event Day Execution",
            date: eventDate.toDateString(),
            status: "Pending",
            description: `Host the ${name}!`
        }
    ];

    // 2. Budget Breakdown (Percentages based on typical event standards)
    const budgetValue = Number(budget) || 0;
    const budgetBreakdown = [
        { category: "Venue & Rentals", amount: budgetValue * 0.4, percentage: 40 },
        { category: "Catering", amount: budgetValue * 0.3, percentage: 30 },
        { category: "Decor & Lighting", amount: budgetValue * 0.15, percentage: 15 },
        { category: "Marketing / Invitations", amount: budgetValue * 0.05, percentage: 5 },
        { category: "Miscellaneous/Buffer", amount: budgetValue * 0.1, percentage: 10 }
    ];

    // 3. Category-Specific Checklist
    let checklist = [
        "Create a backup plan for weather (if applicable)",
        "Confirm audiovisual set-up",
        "Prepare event-day survival kit",
    ];

    if (category === 'Wedding') {
        checklist.unshift("Finalize seating chart", "Pick up wedding attire", "Order flowers");
    } else if (category === 'Conference' || category === 'Corporate Event') {
        checklist.unshift("Coordinate with speakers", "Prepare registration desk", "Print badges");
    } else if (category === 'Birthday Party') {
        checklist.unshift("Order cake", "Set up entertainment/games", "Buy party favors");
    }

    return {
        timeline,
        budgetBreakdown,
        checklist: checklist.map(item => ({ item, completed: false })),
        aiSuggestions: [
            `Considering your budget of ₹${budgetValue}, we recommend optimizing Venue costs to save more for Catering.`,
            `For a ${category}, starting invitations 15 days prior is ideal.`,
            "Tip: Use social media polls to engage participants before the event."
        ]
    };
};

module.exports = { generateEventPlan };
