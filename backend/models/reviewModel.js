const mongoose = require('mongoose');

const reviewSchema = mongoose.Schema({
<<<<<<< HEAD
    event: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Event' },
    user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    vendor: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Vendor' },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    metrics: {
        responsiveness: { type: Number, min: 1, max: 5 },
        punctuality: { type: Number, min: 1, max: 5 },
        quality: { type: Number, min: 1, max: 5 }
    },
    isVerified: { type: Boolean, default: true } // Since we link it to an actual event
}, {
    timestamps: true
=======
    vendor: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Vendor' },
    user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
}, {
    timestamps: true,
>>>>>>> origin/nashwa
});

module.exports = mongoose.model('Review', reviewSchema);
