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

    // Location Data
    district: { type: String, required: true },
    address: { type: String },
    location: {
        lat: { type: Number },
        lng: { type: Number }
    },

    // Ratings & Metrics
    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    reliabilityScore: { type: Number, default: 0 }, // 0-100 scale
    performanceMetrics: {
        responsiveness: { type: Number, default: 0 },
        punctuality: { type: Number, default: 0 },
        quality: { type: Number, default: 0 }
    }
}, {
    timestamps: true,
});

module.exports = mongoose.model('Vendor', vendorSchema);
