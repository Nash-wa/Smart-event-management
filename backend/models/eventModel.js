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
    venue: { type: String },
    address: { type: String },
    capacity: { type: Number },
    budget: { type: Number },
    selectedVendors: { type: Map, of: Object }, // Store selected vendor details
    features: { type: Object },
    plan: { type: Object }, // To store generated plan (Timeline, Budget Breakdown, etc.)
    paymentStatus: { type: String, enum: ['unpaid', 'partial', 'paid'], default: 'unpaid' },
    totalPaid: { type: Number, default: 0 },
    platformCommission: { type: Number, default: 0 }, // 10% commission
    status: {
        type: String,
        enum: ['draft', 'published', 'active', 'completed', 'cancelled'],
        default: 'published'
    },
    tags: [{ type: String }],
    bannerImage: { type: String, default: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&q=80&w=1200' },
    isPublic: { type: Boolean, default: true },
    attendeeCount: { type: Number, default: 0 },
}, {
    timestamps: true,
});

module.exports = mongoose.model('Event', eventSchema);
