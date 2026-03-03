const mongoose = require('mongoose');

const serviceSchema = mongoose.Schema({
    name: { type: String, required: true },
    category: {
        type: String,
        enum: ['Catering', 'Photography', 'DJ', 'Decoration', 'Music', 'Venue', 'Other'],
        required: true
    },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    vendor: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    isAvailable: { type: Boolean, default: true },
    images: [{ type: String }],
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviews: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true }
}, {
    timestamps: true,
});

module.exports = mongoose.model('Service', serviceSchema);
