const mongoose = require('mongoose');

const observationSchema = new mongoose.Schema({
    itemNameOrNumber: {
        type: String,
        trim: true
    },
    barrageNo: { type: String, trim: true },
    scanType: { type: String, trim: true },
    quantity: { type: String, trim: true },
    observations: {
        type: String,
        trim: true
    },
    result: {
        type: String,
        enum: ["Accept", "Reject", "Repair", "Pending"],
        default: "Pending"
    }
}, { _id: false });

const liquidPenetrantInspectionSchema = new mongoose.Schema({

    // Basic Details
    client_name: { type: String, trim: true },
    report_no: { type: String, trim: true, unique: true, sparse: true },
    vendor: { type: String, trim: true },
    date: { type: Date, default: Date.now },
    item: { type: String, trim: true },
    inspectionLocation: { type: String, trim: true },
    procedureNo: { type: String, trim: true },
    acceptanceStandard: { type: String, trim: true },

    // Penetrant Details
    penetrant: {
        make: { type: String, trim: true },
        batch: { type: String, trim: true },
        type: { type: String, trim: true }
    },

    // Developer Details
    developer: {
        make: { type: String, trim: true },
        batch: { type: String, trim: true },
        form: { type: String, trim: true }
    },

    // Test Parameters
    surfaceTemp: { type: String },
    dwellTime: { type: String },
    lightIntensity: { type: String },
    developingTime: { type: String },

    // Results Section
    testResults: [observationSchema],

    // Consumables Checkboxes
    penetrantTypeCheck: [{ type: String }],
    developerFormCheck: [{ type: String }],

    findingsIfAny: { type: String, trim: true },

    // Signatures
    testedBy: {
        name: { type: String },
        sign: { type: String }, // image URL or base64
        date: { type: Date, default: Date.now }
    },

    reviewedBy: {
        name: { type: String },
        sign: { type: String }, // image URL or base64
        date: { type: Date, default: Date.now }
    },

    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },

    // Meta fields for app logic (kept for compatibility)
    status: { type: String, enum: ['draft', 'submitted'], default: 'draft' },
    formType: { type: String, default: 'liquid-penetrant' }

}, { timestamps: true });

// Pre-save hook for Report No — only runs on NEW documents (not updates)
liquidPenetrantInspectionSchema.pre('save', async function () {
    if (this.isNew && !this.report_no) {
        const year = new Date().getFullYear();
        const prefix = `PT-${year}-`;

        // Fetch all reports for the current year to find the true numeric maximum
        const reports = await this.constructor.find(
            { report_no: new RegExp(`^${prefix}`) },
            { report_no: 1 }
        );

        let maxNum = 0;
        reports.forEach(r => {
            const parts = r.report_no.split('-');
            if (parts.length >= 3) {
                const num = parseInt(parts[2], 10);
                if (!isNaN(num) && num > maxNum) maxNum = num;
            }
        });

        this.report_no = `${prefix}${(maxNum + 1).toString().padStart(4, '0')}`;
        console.log(`[LPT-GEN] Generated ${this.report_no}`);
    }
});

module.exports = mongoose.model('LiquidPenetrantInspection', liquidPenetrantInspectionSchema);
