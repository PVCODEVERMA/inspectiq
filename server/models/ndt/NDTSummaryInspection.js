const mongoose = require('mongoose');

const ndtSummaryInspectionSchema = new mongoose.Schema({
    // General Info
    report_no: { type: String, required: true, unique: true },
    client_name: { type: String, required: true },
    vendor_name: String,
    date: { type: Date, default: Date.now },
    item_details: String,
    location: String,

    // Technical Specs
    material_spec: String,
    procedure_no: String,
    thickness: String,
    acceptance_std: String,

    // Equipment & Parameters (Similar to MPT usually)
    lighting_equip: String,
    instrument_make: String,
    light_intensity: String,
    instrument_id: String,
    instrument_type: [String],
    method: [String],
    current_type: [String],
    contrast: [String],

    // Results Table
    results: [{
        item_name: String,
        barrage_no: String,
        qty: Number,
        observations: String,
        result: { type: String, enum: ['Satisfactory', 'Unsatisfactory'] }
    }],

    // Summary Text
    summary_text: String,

    // Meta
    status: { type: String, enum: ['draft', 'submitted'], default: 'draft' },
    created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    formType: { type: String, default: 'ndt-summary-report' }
}, { timestamps: true });

ndtSummaryInspectionSchema.pre('validate', async function () {
    if (!this.report_no) {
        const year = new Date().getFullYear();
        const prefix = `NDT-${year}-`;

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
        console.log(`[NDT-GEN] Generated ${this.report_no} (Max was ${maxNum})`);
    }
});

module.exports = mongoose.model('NDTSummaryInspection', ndtSummaryInspectionSchema);
