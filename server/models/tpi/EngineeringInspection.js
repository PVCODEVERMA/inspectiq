const mongoose = require('mongoose');

const engineeringInspectionSchema = new mongoose.Schema({
    // General Info
    report_no: { type: String, required: true, sparse: true },
    project_name: { type: String, required: false },
    client_name: { type: String, required: true },
    vendor_name: String,
    date: { type: Date, default: Date.now },
    site_location: String,

    // Reference Details (Box 2)
    inspection_date: Date,
    po_number: String,
    rfi_number: String,
    itp_qap_number: String,

    // Scope of Inspection (Box 3) - Array for checkbox_group
    scope_selection: [String],

    // Inspection Summary (Box 4)
    ncr_issued: { type: String, enum: ['Yes', 'No'], default: 'No' },
    order_completed: { type: String, enum: ['Yes', 'No'], default: 'No' },
    overall_result: { type: String, enum: ['Satisfactory', 'Not Satisfactory', 'Conditional'], default: 'Satisfactory' },

    // Offered Items Table (Box 5)
    offered_items: [{
        sr_no: String,
        description: String,
        inspected_qty: String,
        accepted_qty: String
    }],

    // Inspection Details / Observations (Box 6)
    detailed_observation: String,

    // Attendees Table (Box 7 & Page 2 Box 1)
    attendees: [{
        name: String,
        position: String,
        company: String,
        contact: String
    }],

    // Referred Documents (Page 2 Box 2)
    referred_documents: [{
        sr_no: String,
        title: String,
        doc_no: String,
        rev_edd: String
    }],

    // Test Instruments (Page 2 Box 3)
    test_instruments: [{
        sr_no: String,
        name: String,
        id_number: String,
        calibration_due: String
    }],

    // Document Attached (Page 2 Box 4)
    documents_attached: [{
        sr_no: String,
        title: String
    }],

    // Signatures (Page 2 Box 5)
    inspector_signature_url: String,
    inspector_date: Date,
    client_signature_url: String,
    client_date: Date,

    // Photos (Page 3)
    annotated_photos: [{
        url: String,
        caption: String
    }],

    // Meta
    status: { type: String, enum: ['draft', 'submitted'], default: 'draft' },
    created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    formType: { type: String, default: 'engineering-inspection' }
}, { timestamps: true, strict: false });

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
