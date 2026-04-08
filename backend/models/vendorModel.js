const mongoose = require('mongoose');

const vendorSchema = mongoose.Schema({
    name: { type: String, required: true },
    category: {
        type: String,
        required: true,
        enum: ['Photography', 'Catering', 'Music/DJ', 'Decoration', 'Venue', 'Invitation']
    },
    price: { type: Number, required: true },
    description: { type: String },
    image: { type: String }, // URL or placeholder
    portfolio: [{ type: String }], // Array of previous work URLs
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    isApproved: { type: Boolean, default: false },

    // Social & Reviews (from HEAD)
    googleReviewsUrl: { type: String },
    instagramUrl: { type: String },
    reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Review' }],

    // Location Data (from origin/main)
    district: { type: String, required: false }, // Made optional to avoid validation errors on existing data
    address: { type: String },
    location: {
        lat: { type: Number },
        lng: { type: Number }
    },

    // Ratings & Metrics (from origin/main)
    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    reliabilityScore: { type: Number, default: 0 }, // 0-100 scale
    performanceMetrics: {
        responsiveness: { type: Number, default: 0 },
        punctuality: { type: Number, default: 0 },
        quality: { type: Number, default: 0 }
    },
    // Availability
    unavailability: [{ type: Date }], // Specific dates blocked by vendor
    workingDays: [{ type: String, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], default: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] }]
}, {
    timestamps: true,
});

module.exports = mongoose.model('Vendor', vendorSchema);
