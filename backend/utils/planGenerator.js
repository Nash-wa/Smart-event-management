/**
 * Generates a structured plan for an event based on its category, budget, and timing.
 * Synchronized with frontend/src/utils/planningEngine.js
 */
const generateEventPlan = (eventData) => {
    const { category, budget, startDate, capacity, venueType, selectedVendors } = eventData;
    const start = new Date(startDate);
    const normalizedCategory = (category || 'default').toLowerCase();
    const vendors = selectedVendors || {};

    // 1. Timeline Generation Templates
    const categories = {
        corporate: [
            { task: "Initial Strategy & Goal Setting", description: "Define objectives, target audience, and key performance indicators for the event.", daysBefore: 90, priority: "High" },
            { task: "Venue & Catering Finalization", description: "Secure a professional venue and finalize corporate-standard catering menus.", daysBefore: 60, priority: "High" },
            { task: "Speaker & Agenda Confirmation", description: "Lock-in session speakers and finalize the event schedule.", daysBefore: 45, priority: "Medium" },
            { task: "Marketing & Registration Launch", description: "Launch the event website and start ticket sales or attendee registration.", daysBefore: 30, priority: "Medium" },
            { task: "Technical Rehearsals", description: "Perform sound checks and presentation rehearsals for all speakers.", daysBefore: 7, priority: "High" },
            { task: "On-site Briefing", description: "Brief the on-site team and vendors on the minute-by-minute execution plan.", daysBefore: 1, priority: "High" }
        ],
        conference: [
            { task: "Call for Abstracts & Paper Review", description: "Invite industrial experts to submit research papers and conduct a peer-review process.", daysBefore: 120, priority: "High" },
            { task: "Keynote & Session Speaker Finalization", description: "Confirm the headline speakers and session chairs for the main tracks.", daysBefore: 90, priority: "High" },
            { task: "Sponsorship Prospectus & Sales", description: "Design sponsorship tiers and reach out to potential corporate partners.", daysBefore: 75, priority: "Medium" },
            { task: "Registration & Abstract Portal Launch", description: "Launch the online portal for attendee registration and paper submissions.", daysBefore: 60, priority: "Medium" },
            { task: "AV & Multi-track Tech Check", description: "Ensure the technical setup supports concurrent sessions and live streaming.", daysBefore: 7, priority: "High" },
            { task: "Venue Load-in & Branding", description: "Coordinate with the venue for stage setup and directional signage installation.", daysBefore: 1, priority: "High" }
        ],
        wedding: [
            { task: "Venue & Date Selection", description: "Choose the perfect date and venue that reflects your vision and budget.", daysBefore: 180, priority: "High" },
            { task: "Vendor Bookings (Catering, Decor)", description: "Secure essential services like catering, flowers, and decorations.", daysBefore: 120, priority: "High" },
            { task: "Guest List & Invitations", description: "Finalize your guest list and send out save-the-dates or formal invites.", daysBefore: 90, priority: "Medium" },
            { task: "Attire & Fittings", description: "Select wedding attire and schedule necessary fittings for the couple.", daysBefore: 60, priority: "Medium" },
            { task: "Final Floor Plans & Seating", description: "Confirm the layout and seating arrangements for the reception.", daysBefore: 14, priority: "High" },
            { task: "Rehearsal Dinner", description: "Host a final gathering with the wedding party before the big day.", daysBefore: 1, priority: "Medium" }
        ],
        workshop: [
            { task: "Content & Curriculum Development", description: "Draft the educational content, hands-on activities, and learning outcomes.", daysBefore: 45, priority: "High" },
            { task: "Materials & Toolkit Procurement", description: "Purchase and prepare all physical toolkits and attendee workbooks.", daysBefore: 30, priority: "Medium" },
            { task: "Interactive Session Planning", description: "Design the breakout sessions and group activities for maximum engagement.", daysBefore: 20, priority: "High" },
            { task: "AV & Tech Setup (Interactive)", description: "Test the interactive displays, stable internet, and collaborative software.", daysBefore: 5, priority: "High" },
            { task: "On-site Lab Preparation", description: "Finalize the physical layout and station readiness for participants.", daysBefore: 1, priority: "Medium" }
        ],
        festival: [
            { task: "Permit & Safety Board Filings", description: "Apply for commercial usage permits, fire safety, and crowd control clearances.", daysBefore: 120, priority: "High" },
            { task: "Stage & Tech Spec Finalization", description: "Determine the technical requirements for the main stage and secondary zones.", daysBefore: 60, priority: "High" },
            { task: "Artist & Performer Logistics", description: "Coordinate travel, accommodation, and green-room requirements for all acts.", daysBefore: 45, priority: "High" },
            { task: "Crowd Control & Security Plan", description: "Execute a detailed security deployment and emergency evacuation protocol.", daysBefore: 30, priority: "High" },
            { task: "On-site Build-out (Phase 01)", description: "Begin the structural installation of stages, booths, and safety barriers.", daysBefore: 5, priority: "High" },
            { task: "Emergency Protocol Review", description: "Final walkthrough with safety officers and emergency response teams.", daysBefore: 1, priority: "High" }
        ],
        exhibition: [
            { task: "Floor Plan & Booth Allocation", description: "Map out the vendor hall and assign booth numbers to exhibitors.", daysBefore: 90, priority: "High" },
            { task: "Exhibitor Manual Dispatch", description: "Send technical requirements and load-in schedules to all confirmed exhibitors.", daysBefore: 60, priority: "Medium" },
            { task: "Shell Scheme Construction", description: "Construct the basic booth frameworks and uniform wall panels.", daysBefore: 15, priority: "High" },
            { task: "Load-in & Cargo Management", description: "Coordinate the arrival of exhibitor equipment and promotional materials.", daysBefore: 3, priority: "High" },
            { task: "Exhibitor Briefing", description: "Final meeting to review logistics, security, and lead-retrieval protocols.", daysBefore: 1, priority: "Medium" }
        ],
        party: [
            { task: "Theme & Decor Concept", description: "Define the visual style, color palette, and overall atmosphere of the party.", daysBefore: 45, priority: "Medium" },
            { task: "Entertainment & DJ Booking", description: "Secure music, performers, or a DJ to keep the guests engaged throughout the event.", daysBefore: 30, priority: "High" },
            { task: "Beverage & Menu Selection", description: "Finalize the drink list and food menu based on the theme and attendee preferences.", daysBefore: 20, priority: "Medium" },
            { task: "Invitations & RSVP Management", description: "Send out digital or physical invites and track guest confirmations real-time.", daysBefore: 15, priority: "Medium" },
            { task: "Lighting & Sound Setup", description: "Coordinating the technical setup to ensure the party has the right mood and audio quality.", daysBefore: 1, priority: "High" }
        ],
        hackathon: [
            { task: "Theme & Challenge Definition", description: "Draft the problem statements, judging criteria, and platform rules.", daysBefore: 60, priority: "High" },
            { task: "Platform & API Partner Selection", description: "Secure cloud credits and specialized API access for participants.", daysBefore: 45, priority: "High" },
            { task: "Internet & Power Redundancy Audit", description: "Validate the venue's ability to handle high-density load and backup systems.", daysBefore: 20, priority: "High" },
            { task: "Mentor & Judge Onboarding", description: "Brief experts on the evaluation process and technical support duties.", daysBefore: 15, priority: "Medium" },
            { task: "Swag & Catering (Midnight Fuel) Plan", description: "Coordinate around-the-clock catering and the procurement of participant kits.", daysBefore: 10, priority: "Medium" },
            { task: "Hardware Setup (LAN/Server)", description: "Finalize the local network configuration and server readiness.", daysBefore: 2, priority: "High" }
        ],
        default: [
            { task: "Concept Definition", description: "Determine the core mission, theme, and scale of the event.", daysBefore: 60, priority: "High" },
            { task: "Key Vendor Procurement", description: "Identify and book the primary service providers required for execution.", daysBefore: 45, priority: "High" },
            { task: "Logistics Planning", description: "Outline transportation, equipment, and on-site support requirements.", daysBefore: 30, priority: "Medium" },
            { task: "Staff Training", description: "Ensure all personnel and volunteers are briefed on their roles and protocols.", daysBefore: 15, priority: "Medium" },
            { task: "Setup & Installation", description: "Physical transformation of the venue and final testing of all systems.", daysBefore: 2, priority: "High" }
        ]
    };

    let tasksData = categories.default;
    if (normalizedCategory.includes('wedding')) tasksData = categories.wedding;
    else if (normalizedCategory.includes('festival')) tasksData = categories.festival;
    else if (normalizedCategory.includes('exhibition')) tasksData = categories.exhibition;
    else if (normalizedCategory.includes('workshop')) tasksData = categories.workshop;
    else if (normalizedCategory.includes('hackathon')) tasksData = categories.hackathon;
    else if (normalizedCategory.includes('party')) tasksData = categories.party;
    else if (normalizedCategory.includes('conference')) tasksData = categories.conference;
    else if (normalizedCategory.includes('corporate')) tasksData = categories.corporate;

    const timeline = tasksData.map(t => {
        const date = new Date(start);
        date.setDate(date.getDate() - t.daysBefore);

        // Check if task is already addressed by selected vendors
        let status = "Pending";
        const taskLower = t.task.toLowerCase();
        const vendorCats = Object.keys(vendors).map(c => c.toLowerCase());

        // Improved logic: check if any selected vendor category matches words in the task
        const relevantKeywords = ['vendor', 'venue', 'catering', 'decor', 'photography', 'music', 'dj', 'entertainment', 'invitation', 'sound', 'lighting'];
        if (relevantKeywords.some(kw => taskLower.includes(kw)) || taskLower.includes('confirm')) {
            if (vendorCats.some(cat => taskLower.includes(cat) || (cat === 'music/dj' && (taskLower.includes('dj') || taskLower.includes('entertainment'))))) {
                status = "Completed";
            }
        }

        return {
            ...t,
            deadline: date.toLocaleDateString(),
            deadlineISO: date.toISOString(),
            status
        };
    });

    // Add feature-specific tasks
    const featureTasks = [];
    if (eventData.features?.food) featureTasks.push({ task: "Menu Selection & Finalization", daysBefore: 20, priority: "High", status: vendors['Catering'] ? "Completed" : "Pending" });
    if (eventData.features?.photography) featureTasks.push({ task: "Photographer Briefing & Shot List", daysBefore: 10, priority: "Medium", status: vendors['Photography'] ? "Completed" : "Pending" });
    if (eventData.features?.ar) featureTasks.push({ task: "AR Waypoint Configuration", daysBefore: 5, priority: "High", status: (eventData.arPoints?.length > 0) ? "Completed" : "Pending" });
    if (eventData.features?.invitations) featureTasks.push({ task: "Digital Invitation Dispatch", daysBefore: 15, priority: "Medium", status: "Pending" });
    if (eventData.features?.registration) featureTasks.push({ task: "Gate Management Setup", daysBefore: 2, priority: "High", status: "Pending" });

    featureTasks.forEach(ft => {
        const date = new Date(start);
        date.setDate(date.getDate() - ft.daysBefore);
        timeline.push({ ...ft, deadline: date.toLocaleDateString(), deadlineISO: date.toISOString() });
    });

    timeline.sort((a, b) => new Date(a.deadlineISO) - new Date(b.deadlineISO));

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

    // Calculate initial readiness score based on pre-selected vendors
    const completedTasks = timeline.filter(t => t.status === "Completed").length;
    const readinessScore = timeline.length > 0 ? Math.round((completedTasks / timeline.length) * 100) : 0;

    return {
        timeline,
        budget: budgetAllocation,
        resources,
        readinessScore
    };
};

module.exports = { generateEventPlan };
