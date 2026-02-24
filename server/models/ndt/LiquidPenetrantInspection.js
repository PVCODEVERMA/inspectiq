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
    report_no: { type: String, trim: true, sparse: true },
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

// Pre-validate hook for Report No — ensures it's generated BEFORE validation
liquidPenetrantInspectionSchema.pre('validate', async function () {
    if (!this.report_no) {
        const year = new Date().getFullYear();
        const prefix = `LPT-${year}-`;

        try {
            // Use the main 'counters' collection for report sequence
            const db = mongoose.connection.db;
            const countersCollection = db.collection('counters');

            const counter = await countersCollection.findOneAndUpdate(
                { _id: `lpt_${year}` },
                { $inc: { seq: 1 } },
                { upsert: true, returnDocument: 'after' }
            );

            const nextSeq = counter.value?.seq || 1;
            this.report_no = `${prefix}${nextSeq.toString().padStart(4, '0')}`;
            console.log(`[LPT-GEN] Generated report number: ${this.report_no}`);
        } catch (error) {
            console.error('[LPT] Counter error:', error);
            // Fallback: scan database for highest report number
            const reports = await this.constructor.countDocuments({
                report_no: new RegExp(`^LPT-${new Date().getFullYear()}-`)
            });

            this.report_no = `${prefix}${(reports + 1).toString().padStart(4, '0')}`;
            console.log(`[LPT-GEN-FALLBACK] Generated report number: ${this.report_no}`);
        }
    }
});

module.exports = mongoose.model('LiquidPenetrantInspection', liquidPenetrantInspectionSchema);
