const mongoose = require('mongoose');

const companyProfileSchema = new mongoose.Schema({
    companyName: {
        type: String,
        required: true,
        trim: true
    },
    address: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        trim: true
    },
    email: {
        type: String,
        trim: true,
        lowercase: true
    },
    website: {
        type: String,
        trim: true
    },
    logoUrl: {
        type: String
    },
    gstin: {
        type: String,
        trim: true
    },
    pan: {
        type: String,
        trim: true
    },
    bankDetails: {
        bankName: String,
        accountNo: String,
        ifscCode: String,
        branch: String
    },
    reportBranding: {
        headerColor: {
            type: String,
            default: '#F44034'
        },
        footerText: String
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('CompanyProfile', companyProfileSchema);
