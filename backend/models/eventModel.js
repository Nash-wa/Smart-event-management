const mongoose = require('mongoose');

const eventSchema = mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    name: { type: String, required: true },
    description: { type: String },
    category: { type: String, required: true },
    mode: { type: String, default: 'Offline' },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    startTime: { type: String },
    endTime: { type: String },
    district: { type: String, required: true },
    venue: { type: String },
    address: { type: String },
    capacity: { type: Number },
    budget: { type: Number },
    location: {
        lat: { type: Number },
        lng: { type: Number },
        displayAddress: { type: String }
    },
    readinessScore: { type: Number, default: 0 },
    arPoints: [{
        label: { type: String },
        instruction: { type: String },
        lat: { type: Number },
        lng: { type: Number },
        pointType: { type: String, enum: ['Entrance', 'Stage', 'Restroom', 'Exit', 'HelpDesk', 'Other'] }
    }],
    selectedVendors: { type: Map, of: Object }, // Store selected vendor details
    manualExpenses: [{
        label: { type: String },
        amount: { type: Number }
    }],
    features: { type: Object },
    plan: { type: Object }, // To store generated plan (Timeline, Budget Breakdown, etc.)
    paymentStatus: { type: String, enum: ['unpaid', 'partial', 'paid'], default: 'unpaid' },
    totalPaid: { type: Number, default: 0 },
    platformCommission: { type: Number, default: 0 }, // 10% commission
}, {
    timestamps: true,
});

module.exports = mongoose.model('Event', eventSchema);
