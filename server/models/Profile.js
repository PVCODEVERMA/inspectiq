const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    full_name: {
        type: String,
        trim: true
    },
    avatar_url: {
        type: String
    },
    phone: {
        type: String
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'pending'],
        default: 'active'
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

profileSchema.pre('save', async function () {
    this.updatedAt = Date.now();
});

module.exports = mongoose.model('Profile', profileSchema);
