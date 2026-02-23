const mongoose = require('mongoose');

const engineeringInspectionSchema = new mongoose.Schema({
    // General Info
    report_no: { type: String, required: true, unique: true },
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

        const nextNum = maxNum + 1;
        this.report_no = `${prefix}${nextNum.toString().padStart(4, '0')}`;
        console.log(`[EI-GEN] Generated ${this.report_no} (Max was ${maxNum})`);
    }
});

module.exports = mongoose.model('EngineeringInspection', engineeringInspectionSchema);
