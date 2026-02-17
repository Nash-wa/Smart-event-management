const mongoose = require('mongoose');

const reviewSchema = mongoose.Schema({
    vendor: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Vendor'
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Review', reviewSchema);
