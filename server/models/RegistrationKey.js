const mongoose = require('mongoose');

const registrationKeySchema = new mongoose.Schema({
    key: {
        type: String,
        required: true,
        unique: true
    },
    role: {
        type: String,
        enum: [
            'service_manager',
            'inspection_coordinator',
            'technical_coordinator',
            'inspector'
        ],
        required: true
    },
    phoneNumber: {
        type: String,
        required: true
    },
    isUsed: {
        type: Boolean,
        default: false
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    usedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    usedAt: {
        type: Date
    }
});

module.exports = mongoose.model('RegistrationKey', registrationKeySchema);
