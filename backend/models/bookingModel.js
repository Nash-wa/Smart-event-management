const mongoose = require('mongoose');

const bookingSchema = mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    event: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Event' },
    vendor: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Vendor' }, // Changed ref from Service to Vendor
    serviceDate: { type: Date, required: true },
    totalPrice: { type: Number, required: true },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'completed', 'cancelled'],
        default: 'pending'
    },
    notes: { type: String },
    paymentStatus: {
        type: String,
        enum: ['unpaid', 'paid', 'refunded', 'other'],
        default: 'unpaid'
    },
    quantity: { type: Number, default: 1 }
}, {
    timestamps: true,
});

module.exports = mongoose.model('Booking', bookingSchema);
