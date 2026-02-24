const mongoose = require('mongoose');

const ultrasonicInspectionSchema = new mongoose.Schema({
    // General Info
    report_no: { type: String, required: true, sparse: true }, // Auto-generated or manual
    client_name: { type: String, required: true },
    vendor_name: String,
    date: { type: Date, default: Date.now },
    item_tested: String,
    location: String,

    // Technical Specs
    welding_process: String,
    material_spec: String,
    surface_condition: String,
    procedure_no: String,
    surface_temp: String,
    acceptance_std: String,

    // Equipment & Technique
    test_methods: String,
    instrument_make: String,
    test_technique: String,
    instrument_id: String,
    couplant: String,
    cable_type: String,

    // Calibration
    calibration_blocks: [String], // IIW V1, V2
    probes: {
        dimension_0: String, frequency_0: String, ref_gain_0: String, range_0: String,
        dimension_45: String, frequency_45: String, ref_gain_45: String, range_45: String,
        dimension_60: String, frequency_60: String, ref_gain_60: String, range_60: String,
        dimension_70: String, frequency_70: String, ref_gain_70: String, range_70: String
    },

    // Sketch
    scanning_sketch: mongoose.Schema.Types.Mixed, // Supports multi-image array or legacy URL string

    // Results Table
    results: [{
        item_name: String,
        barrage_no: String,
        scan_type: String,
        qty: Number,
        observations: String,
        result: { type: String, enum: ['Accept', 'Reject'] }
    }],

    // Meta
    status: { type: String, enum: ['draft', 'submitted'], default: 'draft' },
    created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    formType: { type: String, default: 'ultrasonic-test' }
}, { timestamps: true });

ultrasonicInspectionSchema.pre('validate', async function () {
    if (!this.report_no) {
        const year = new Date().getFullYear();
        const prefix = `UT-${year}-`;

        try {
            // Use the main 'counters' collection for report sequence
            const db = mongoose.connection.db;
            const countersCollection = db.collection('counters');
            
            const counter = await countersCollection.findOneAndUpdate(
                { _id: `ut_${year}` },
                { $inc: { seq: 1 } },
                { upsert: true, returnDocument: 'after' }
            );

            const nextSeq = counter.value?.seq || 1;
            this.report_no = `${prefix}${nextSeq.toString().padStart(4, '0')}`;
            console.log(`[UT-GEN] Generated report number: ${this.report_no}`);
        } catch (error) {
            console.error('[UT] Counter error:', error);
            // Fallback: scan database for highest report number
            const reports = await this.constructor.countDocuments({
                report_no: new RegExp(`^UT-${new Date().getFullYear()}-`)
            });

            this.report_no = `${prefix}${(reports + 1).toString().padStart(4, '0')}`;
            console.log(`[UT-GEN-FALLBACK] Generated report number: ${this.report_no}`);
        }
    }
});

module.exports = mongoose.model('UltrasonicInspection', ultrasonicInspectionSchema);
