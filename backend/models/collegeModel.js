const mongoose = require('mongoose');

const collegeSchema = mongoose.Schema({
    name: { type: String, required: true, unique: true },
    district: { type: String, required: false },
    address: { type: String },
    description: { type: String },
    location: {
        lat: { type: Number },
        lng: { type: Number }
    },
    tags: [String],
    isApproved: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('College', collegeSchema);
