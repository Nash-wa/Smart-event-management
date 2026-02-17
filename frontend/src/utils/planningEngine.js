/**
 * Smart Planning Engine
 * Data-driven calculations for professional event operations.
 */

export const calculateTimeline = (startDate, category) => {
    const start = new Date(startDate);
    const timeline = [];

    const categories = {
        corporate: [
            { task: "Initial Strategy & Goal Setting", daysBefore: 90, priority: "High" },
            { task: "Venue & Catering Finalization", daysBefore: 60, priority: "High" },
            { task: "Speaker & Agenda Confirmation", daysBefore: 45, priority: "Medium" },
            { task: "Marketing & Registration Launch", daysBefore: 30, priority: "Medium" },
            { task: "Technical Rehearsals", daysBefore: 7, priority: "High" },
            { task: "On-site Briefing", daysBefore: 1, priority: "High" }
        ],
        wedding: [
            { task: "Venue & Date Selection", daysBefore: 180, priority: "High" },
            { task: "Vendor Bookings (Catering, Decor)", daysBefore: 120, priority: "High" },
            { task: "Guest List & Invitations", daysBefore: 90, priority: "Medium" },
            { task: "Attire & Fittings", daysBefore: 60, priority: "Medium" },
            { task: "Final Floor Plans & Seating", daysBefore: 14, priority: "High" },
            { task: "Rehearsal Dinner", daysBefore: 1, priority: "Medium" }
        ],
        default: [
            { task: "Concept Definition", daysBefore: 60, priority: "High" },
            { task: "Key Vendor Procurement", daysBefore: 45, priority: "High" },
            { task: "Logistics Planning", daysBefore: 30, priority: "Medium" },
            { task: "Staff Training", daysBefore: 15, priority: "Medium" },
            { task: "Setup & Installation", daysBefore: 2, priority: "High" }
        ]
    };

    const normalizedCategory = category.toLowerCase();
    let tasks = categories.default;

    if (normalizedCategory.includes('wedding')) {
        tasks = categories.wedding;
    } else if (normalizedCategory.includes('corporate') || normalizedCategory.includes('conference') || normalizedCategory.includes('workshop')) {
        tasks = categories.corporate;
    }

    return tasks.map(t => {
        const date = new Date(start);
        date.setDate(date.getDate() - t.daysBefore);
        return {
            ...t,
            deadline: date.toLocaleDateString(),
            status: "Pending"
        };
    }).sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
};

export const calculateBudgetAllocation = (totalBudget, category) => {
    const allocations = {
        corporate: [
            { category: "Venue & AV", percentage: 0.4 },
            { category: "Catering", percentage: 0.3 },
            { category: "Marketing", percentage: 0.15 },
            { category: "Operations", percentage: 0.1 },
            { category: "Contingency", percentage: 0.05 }
        ],
        wedding: [
            { category: "Venue & Decor", percentage: 0.45 },
            { category: "Catering", percentage: 0.35 },
            { category: "Photography", percentage: 0.1 },
            { category: "Entertainment", percentage: 0.05 },
            { category: "Contingency", percentage: 0.05 }
        ],
        default: [
            { category: "Operations", percentage: 0.5 },
            { category: "Services", percentage: 0.4 },
            { category: "Contingency", percentage: 0.1 }
        ]
    };

    const normalizedCategory = category.toLowerCase();
    let rules = allocations.default;

    if (normalizedCategory.includes('wedding')) {
        rules = allocations.wedding;
    } else if (normalizedCategory.includes('corporate') || normalizedCategory.includes('conference') || normalizedCategory.includes('workshop')) {
        rules = allocations.corporate;
    }

    return rules.map(r => ({
        category: r.category,
        amount: Math.round(totalBudget * r.percentage),
        percentage: r.percentage * 100
    }));
};

export const estimateResources = (attendees, venueType) => {
    // Basic heuristics for resource estimation
    const staffRatio = venueType?.toLowerCase() === 'outdoor' ? 15 : 20; // 1 staff per X attendees
    const securityRatio = 50;

    return [
        { resource: "Event Staff", quantity: Math.ceil(attendees / staffRatio), unit: "Personnel" },
        { resource: "Security", quantity: Math.ceil(attendees / securityRatio), unit: "Personnel" },
        { resource: "AV Technicians", quantity: Math.max(2, Math.ceil(attendees / 100)), unit: "Personnel" },
        { resource: "Check-in Points", quantity: Math.ceil(attendees / 150), unit: "Stations" }
    ];
};

export const calculateReadinessScore = (tasks) => {
    if (!tasks || tasks.length === 0) return 0;
    const completed = tasks.filter(t => t.status === "Completed").length;
    return Math.round((completed / tasks.length) * 100);
};
