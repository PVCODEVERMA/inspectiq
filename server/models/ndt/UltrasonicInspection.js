const mongoose = require('mongoose');

const ultrasonicInspectionSchema = new mongoose.Schema({
    // General Info
    report_no: { type: String, required: true, unique: true }, // Auto-generated or manual
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
        console.log(`[UT-GEN] Generated ${this.report_no} (Max was ${maxNum})`);
    }
});

module.exports = mongoose.model('UltrasonicInspection', ultrasonicInspectionSchema);
