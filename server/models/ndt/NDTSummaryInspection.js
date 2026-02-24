const mongoose = require('mongoose');

const ndtSummaryInspectionSchema = new mongoose.Schema({
    // General Info
    report_no: { type: String, required: true, sparse: true },
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

        try {
            // Use the main 'counters' collection for report sequence
            const db = mongoose.connection.db;
            const countersCollection = db.collection('counters');
            
            const counter = await countersCollection.findOneAndUpdate(
                { _id: `ndt_${year}` },
                { $inc: { seq: 1 } },
                { upsert: true, returnDocument: 'after' }
            );

            const nextSeq = counter.value?.seq || 1;
            this.report_no = `${prefix}${nextSeq.toString().padStart(4, '0')}`;
            console.log(`[NDT-GEN] Generated report number: ${this.report_no}`);
        } catch (error) {
            console.error('[NDT] Counter error:', error);
            // Fallback: scan database for highest report number
            const reports = await this.constructor.countDocuments({
                report_no: new RegExp(`^NDT-${new Date().getFullYear()}-`)
            });

            this.report_no = `${prefix}${(reports + 1).toString().padStart(4, '0')}`;
            console.log(`[NDT-GEN-FALLBACK] Generated report number: ${this.report_no}`);
        }
    }
});

module.exports = mongoose.model('NDTSummaryInspection', ndtSummaryInspectionSchema);
