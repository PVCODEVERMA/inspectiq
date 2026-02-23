const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    phoneNumber: {
        type: String,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    privateKey: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: [
            'service_manager',
            'inspection_coordinator',
            'technical_coordinator',
            'inspector',
            'master_admin'
        ],
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isOnline: {
        type: Boolean,
        default: false
    },
    lastSeen: {
        type: Date,
        default: Date.now
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    assignedServices: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Service'
    }]
});

// Hash password before saving
userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    } catch (err) {
        throw err;
    }
});

// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Method to compare private key (kept for backward compatibility)
userSchema.methods.compareKey = async function (candidateKey) {
    return await bcrypt.compare(candidateKey, this.privateKey);
};

module.exports = mongoose.model('User', userSchema);
