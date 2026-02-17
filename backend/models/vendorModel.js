const mongoose = require('mongoose');

const vendorSchema = mongoose.Schema({
    name: { type: String, required: true },
    category: {
        type: String,
        required: true,
        enum: ['Photography', 'Catering', 'Music/DJ', 'Decoration', 'Venue', 'Invitation']
    },
    price: { type: Number, required: true },
    rating: { type: Number, default: 0 },
    description: { type: String },
    image: { type: String }, // URL or placeholder
    portfolio: [{ type: String }], // Array of previous work URLs
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    isApproved: { type: Boolean, default: false },
    googleReviewsUrl: { type: String },
    instagramUrl: { type: String },
    reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Review' }],
}, {
    timestamps: true,
});

module.exports = mongoose.model('Vendor', vendorSchema);
