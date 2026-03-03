const mongoose = require('mongoose');

const arLayoutSchema = mongoose.Schema({
    event: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Event'
    },
    layoutData: {
        type: Object,
        required: true
    },
    screenshot: {
        type: String // URL to a screenshot if applicable
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('ARLayout', arLayoutSchema);
