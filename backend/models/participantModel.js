const mongoose = require('mongoose');

const participantSchema = mongoose.Schema({
    event: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Event' },
    name: { type: String, required: true },
    email: { type: String, required: true },
    role: { type: String, enum: ['Attendee', 'Speaker', 'VIP', 'Staff'], default: 'Attendee' },
    status: { type: String, enum: ['Pending', 'Confirmed', 'Declined'], default: 'Pending' },
    invitationSent: { type: Boolean, default: false },
    checkInStatus: { type: String, enum: ['Not Checked In', 'Checked In'], default: 'Not Checked In' },
    ticketId: { type: String, unique: true, sparse: true },
}, {
    timestamps: true,
});

module.exports = mongoose.model('Participant', participantSchema);
