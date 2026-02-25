const mongoose = require('mongoose');

const messageSchema = mongoose.Schema({
    event: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Event' },
    sender: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    text: { type: String, required: true },
    type: { type: String, enum: ['Urgent', 'Info', 'Schedule'], default: 'Info' },
    target: { type: String, enum: ['All', 'Staff', 'VIP'], default: 'All' },
}, {
    timestamps: true,
});

module.exports = mongoose.model('Message', messageSchema);
