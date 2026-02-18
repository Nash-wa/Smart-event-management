const mongoose = require('mongoose');

const registrationSchema = mongoose.Schema({
    event: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Event' },
    user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    ticketId: { type: String, unique: true, required: true },
    registrationDate: { type: Date, default: Date.now },
    status: { type: String, enum: ['confirmed', 'cancelled', 'pending'], default: 'confirmed' },
    checkedIn: { type: Boolean, default: false }
}, {
    timestamps: true,
});

module.exports = mongoose.model('Registration', registrationSchema);
