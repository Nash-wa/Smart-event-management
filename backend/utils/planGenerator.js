/**
 * Generates a structured plan for an event based on its category, budget, and timing.
 * Synchronized with frontend/src/utils/planningEngine.js
 */
const generateEventPlan = (eventData) => {
    const { category, budget, startDate, capacity, venueType } = eventData;
    const start = new Date(startDate);
    const normalizedCategory = (category || 'default').toLowerCase();

    // 1. Timeline Generation Templates
    const categories = {
        corporate: [
            { task: "Initial Strategy & Goal Setting", daysBefore: 90, priority: "High" },
            { task: "Venue & Catering Finalization", daysBefore: 60, priority: "High" },
            { task: "Speaker & Agenda Confirmation", daysBefore: 45, priority: "Medium" },
            { task: "Marketing & Registration Launch", daysBefore: 30, priority: "Medium" },
            { task: "Technical Rehearsals", daysBefore: 7, priority: "High" },
            { task: "On-site Briefing", daysBefore: 1, priority: "High" }
        ],
        conference: [
            { task: "Call for Abstracts & Paper Review", daysBefore: 120, priority: "High" },
            { task: "Keynote & Session Speaker Finalization", daysBefore: 90, priority: "High" },
            { task: "Sponsorship Prospectus & Sales", daysBefore: 75, priority: "Medium" },
            { task: "Registration & Abstract Portal Launch", daysBefore: 60, priority: "Medium" },
            { task: "AV & Multi-track Tech Check", daysBefore: 7, priority: "High" },
            { task: "Venue Load-in & Branding", daysBefore: 1, priority: "High" }
        ],
        wedding: [
            { task: "Venue & Date Selection", daysBefore: 180, priority: "High" },
            { task: "Vendor Bookings (Catering, Decor)", daysBefore: 120, priority: "High" },
            { task: "Guest List & Invitations", daysBefore: 90, priority: "Medium" },
            { task: "Attire & Fittings", daysBefore: 60, priority: "Medium" },
            { task: "Final Floor Plans & Seating", daysBefore: 14, priority: "High" },
            { task: "Rehearsal Dinner", daysBefore: 1, priority: "Medium" }
        ],
        workshop: [
            { task: "Content & Curriculum Development", daysBefore: 45, priority: "High" },
            { task: "Materials & Toolkit Procurement", daysBefore: 30, priority: "Medium" },
            { task: "Interactive Session Planning", daysBefore: 20, priority: "High" },
            { task: "AV & Tech Setup (Interactive)", daysBefore: 5, priority: "High" },
            { task: "On-site Lab Preparation", daysBefore: 1, priority: "Medium" }
        ],
        festival: [
            { task: "Permit & Safety Board Filings", daysBefore: 120, priority: "High" },
            { task: "Stage & Tech Spec Finalization", daysBefore: 60, priority: "High" },
            { task: "Artist & Performer Logistics", daysBefore: 45, priority: "High" },
            { task: "Crowd Control & Security Plan", daysBefore: 30, priority: "High" },
            { task: "On-site Build-out (Phase 01)", daysBefore: 5, priority: "High" },
            { task: "Emergency Protocol Review", daysBefore: 1, priority: "High" }
        ],
        exhibition: [
            { task: "Floor Plan & Booth Allocation", daysBefore: 90, priority: "High" },
            { task: "Exhibitor Manual Dispatch", daysBefore: 60, priority: "Medium" },
            { task: "Shell Scheme Construction", daysBefore: 15, priority: "High" },
            { task: "Load-in & Cargo Management", daysBefore: 3, priority: "High" },
            { task: "Exhibitor Briefing", daysBefore: 1, priority: "Medium" }
        ],
        party: [
            { task: "Theme & Decor Concept", daysBefore: 45, priority: "Medium" },
            { task: "Entertainment & DJ Booking", daysBefore: 30, priority: "High" },
            { task: "Beverage & Menu Selection", daysBefore: 20, priority: "Medium" },
            { task: "Invitations & RSVP Management", daysBefore: 15, priority: "Medium" },
            { task: "Lighting & Sound Setup", daysBefore: 1, priority: "High" }
        ],
        hackathon: [
            { task: "Theme & Challenge Definition", daysBefore: 60, priority: "High" },
            { task: "Platform & API Partner Selection", daysBefore: 45, priority: "High" },
            { task: "Internet & Power Redundancy Audit", daysBefore: 20, priority: "High" },
            { task: "Mentor & Judge Onboarding", daysBefore: 15, priority: "Medium" },
            { task: "Swag & Catering (Midnight Fuel) Plan", daysBefore: 10, priority: "Medium" },
            { task: "Hardware Setup (LAN/Server)", daysBefore: 2, priority: "High" }
        ],
        default: [
            { task: "Concept Definition", daysBefore: 60, priority: "High" },
            { task: "Key Vendor Procurement", daysBefore: 45, priority: "High" },
            { task: "Logistics Planning", daysBefore: 30, priority: "Medium" },
            { task: "Staff Training", daysBefore: 15, priority: "Medium" },
            { task: "Setup & Installation", daysBefore: 2, priority: "High" }
        ]
    };

    let tasks = categories.default;
    if (normalizedCategory.includes('wedding')) tasks = categories.wedding;
    else if (normalizedCategory.includes('festival')) tasks = categories.festival;
    else if (normalizedCategory.includes('exhibition')) tasks = categories.exhibition;
    else if (normalizedCategory.includes('workshop')) tasks = categories.workshop;
    else if (normalizedCategory.includes('hackathon')) tasks = categories.hackathon;
    else if (normalizedCategory.includes('party')) tasks = categories.party;
    else if (normalizedCategory.includes('conference')) tasks = categories.conference;
    else if (normalizedCategory.includes('corporate')) tasks = categories.corporate;

    const timeline = tasks.map(t => {
        const date = new Date(start);
        date.setDate(date.getDate() - t.daysBefore);
        return {
            ...t,
            deadline: date.toLocaleDateString(),
            status: "Pending"
        };
    }).sort((a, b) => new Date(a.deadline) - new Date(b.deadline));

    // 2. Budget Allocation
    const allocations = {
        corporate: [
            { category: "Venue & AV", percentage: 0.4 },
            { category: "Catering", percentage: 0.3 },
            { category: "Marketing", percentage: 0.15 },
            { category: "Operations", percentage: 0.1 },
            { category: "Contingency", percentage: 0.05 }
        ],
        conference: [
            { category: "Venue & Multi-track AV", percentage: 0.45 },
            { category: "Catering & Networking", percentage: 0.25 },
            { category: "Marketing & Print", percentage: 0.15 },
            { category: "Speaker Logistics", percentage: 0.1 },
            { category: "Contingency", percentage: 0.05 }
        ],
        wedding: [
            { category: "Venue & Decor", percentage: 0.45 },
            { category: "Catering", percentage: 0.35 },
            { category: "Photography", percentage: 0.1 },
            { category: "Entertainment", percentage: 0.05 },
            { category: "Contingency", percentage: 0.05 }
        ],
        festival: [
            { category: "Talent & Performer Fees", percentage: 0.35 },
            { category: "AV & Stage Tech", percentage: 0.25 },
            { category: "Safety & Crowd Control", percentage: 0.2 },
            { category: "Marketing", percentage: 0.1 },
            { category: "Contingency", percentage: 0.1 }
        ],
        exhibition: [
            { category: "Venue Hire", percentage: 0.4 },
            { category: "Structural Build", percentage: 0.3 },
            { category: "AV & Logistics", percentage: 0.15 },
            { category: "Sales & Marketing", percentage: 0.1 },
            { category: "Contingency", percentage: 0.05 }
        ],
        hackathon: [
            { category: "Cloud & Infrastructure", percentage: 0.3 },
            { category: "Catering (24/7)", percentage: 0.25 },
            { category: "Prizes & Grants", percentage: 0.25 },
            { category: "Marketing & Swag", percentage: 0.15 },
            { category: "Contingency", percentage: 0.05 }
        ],
        default: [
            { category: "Operations", percentage: 0.5 },
            { category: "Services", percentage: 0.4 },
            { category: "Contingency", percentage: 0.1 }
        ]
    };

    let rules = allocations.default;
    if (normalizedCategory.includes('wedding')) rules = allocations.wedding;
    else if (normalizedCategory.includes('festival')) rules = allocations.festival;
    else if (normalizedCategory.includes('exhibition')) rules = allocations.exhibition;
    else if (normalizedCategory.includes('hackathon')) rules = allocations.hackathon;
    else if (normalizedCategory.includes('conference')) rules = allocations.conference;
    else if (normalizedCategory.includes('corporate') || normalizedCategory.includes('workshop')) {
        rules = allocations.corporate;
    }

    const budgetVal = Number(budget) || 0;
    const budgetAllocation = rules.map(r => ({
        category: r.category,
        amount: Math.round(budgetVal * r.percentage),
        percentage: r.percentage * 100
    }));

    // 3. Resource Estimation
    const attendees = Number(capacity) || 100;
    const staffRatio = (venueType || '').toLowerCase() === 'outdoor' ? 15 : 20;

    let securityRatio = 50;
    if (normalizedCategory.includes('festival')) securityRatio = 30;
    if (normalizedCategory.includes('party')) securityRatio = 40;

    const resources = [
        { resource: "Event Staff", quantity: Math.ceil(attendees / staffRatio), unit: "Personnel" },
        { resource: "Security", quantity: Math.ceil(attendees / securityRatio), unit: "Personnel" },
    ];

    if (normalizedCategory.includes('workshop')) {
        resources.push({ resource: "Facilitators", quantity: Math.ceil(attendees / 25), unit: "Personnel" });
        resources.push({ resource: "Material Kits", quantity: attendees, unit: "Units" });
    } else if (normalizedCategory.includes('festival')) {
        resources.push({ resource: "Field Technicians", quantity: Math.ceil(attendees / 100), unit: "Personnel" });
        resources.push({ resource: "Safety Barriers", quantity: Math.ceil(attendees / 10), unit: "Meters" });
    } else if (normalizedCategory.includes('hackathon')) {
        resources.push({ resource: "Cloud Credits", quantity: attendees * 50, unit: "USD" });
        resources.push({ resource: "Mentors", quantity: Math.ceil(attendees / 15), unit: "Personnel" });
        resources.push({ resource: "Extension Boards", quantity: Math.ceil(attendees / 4), unit: "Nodes" });
        resources.push({ resource: "Redundant WiFi", quantity: 2, unit: "Uplinks" });
    } else {
        resources.push({ resource: "AV Technicians", quantity: Math.max(2, Math.ceil(attendees / 100)), unit: "Personnel" });
        resources.push({ resource: "Check-in Points", quantity: Math.ceil(attendees / 150), unit: "Stations" });
    }

    return {
        timeline,
        budget: budgetAllocation,
        resources,
        readinessScore: 0
    };
};

module.exports = { generateEventPlan };
