const mongoose = require('mongoose');

const engineeringInspectionSchema = new mongoose.Schema({
    // General Info
    report_no: { type: String, required: true, sparse: true },
    project_name: { type: String, required: true },
    client_name: { type: String, required: true },
    vendor_name: String,
    date: { type: Date, default: Date.now },
    site_location: String,

    // Reference Details
    inspection_date: Date,
    po_number: String,
    rfi_number: String,
    itp_number: String,

    // Scope of Inspection (Checkboxes)
    scope_selection: {
        pim: Boolean,
        inprocess: Boolean,
        final: Boolean,
        mechanical: Boolean,
        electrical: Boolean,
        instrumentation: Boolean,
        visual: Boolean,
        dimensions: Boolean,
        painting: Boolean,
        documentreview: Boolean,
        dtwitness: Boolean,
        ndtwitness: Boolean,
        tpm: Boolean,
        fat: Boolean
    },

    // Inspection Summary
    summary_result: {
        ncr_issued: { type: String, enum: ['Yes', 'No'], default: 'No' },
        order_completed: { type: String, enum: ['Yes', 'No'], default: 'No' },
        overall_result: { type: String, enum: ['Satisfactory', 'Not Satisfactory', 'Conditional'], default: 'Satisfactory' }
    },

    // Offered Items Table
    offered_items: [{
        description: String,
        inspected_qty: String,
        accepted_qty: String
    }],

    // Inspection Details / Observations
    detailed_observation: String,

    // Attendees Table
    attendees: [{
        name: String,
        position: String,
        company: String,
        contact: String
    }],

    // Referred Documents
    referred_documents: [{
        title: String,
        doc_no: String,
        rev_edd: String
    }],

    // Test Instruments
    test_instruments: [{
        name: String,
        id_number: String,
        calibration_due: String
    }],

    // Client Documents
    client_documents: [{
        title: String,
        reference: String,
        date: String
    }],

    // Signatures
    inspector_signature_url: String, // URL from Cloudinary
    reviewed_by_client: {
        signature_url: String,
        date: Date
    },

    // Photos
    annotated_photos: [{
        url: String,
        caption: String
    }],

    // Meta
    status: { type: String, enum: ['draft', 'submitted'], default: 'draft' },
    created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    formType: { type: String, default: 'engineering-inspection' }
}, { timestamps: true });

// Auto-generate Report Number
engineeringInspectionSchema.pre('validate', async function () {
    if (!this.report_no) {
        const year = new Date().getFullYear();
        const prefix = `EI-${year}-`;

        try {
            // Use the main 'counters' collection for report sequence
            const db = mongoose.connection.db;
            const countersCollection = db.collection('counters');
            
            const counter = await countersCollection.findOneAndUpdate(
                { _id: `ei_${year}` },
                { $inc: { seq: 1 } },
                { upsert: true, returnDocument: 'after' }
            );

            const nextSeq = counter.value?.seq || 1;
            this.report_no = `${prefix}${nextSeq.toString().padStart(4, '0')}`;
            console.log(`[EI-GEN] Generated report number: ${this.report_no}`);
        } catch (error) {
            console.error('[EI] Counter error:', error);
            // Fallback: scan database for highest report number
            const reports = await this.constructor.countDocuments({
                report_no: new RegExp(`^EI-${new Date().getFullYear()}-`)
            });

            this.report_no = `${prefix}${(reports + 1).toString().padStart(4, '0')}`;
            console.log(`[EI-GEN-FALLBACK] Generated report number: ${this.report_no}`);
        }
    }
});

module.exports = mongoose.model('EngineeringInspection', engineeringInspectionSchema);
