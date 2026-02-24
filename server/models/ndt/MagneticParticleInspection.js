const mongoose = require('mongoose');

const magneticParticleInspectionSchema = new mongoose.Schema({
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

    // Equipment
    lighting_equip: String,
    instrument_make: String,
    light_intensity: String,
    instrument_id: String,
    instrument_type: [String], // YOKE, PROD
    method: [String], // WET, DRY
    current_type: [String], // AC, DC
    contrast: [String], // YES, NO

    // Results Table
    results: [{
        item_name: String,
        barrage_no: String,
        qty: Number,
        observations: String,
        result: { type: String, enum: ['Accept', 'Reject'] }
    }],

    // Meta
    status: { type: String, enum: ['draft', 'submitted'], default: 'draft' },
    created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    formType: { type: String, default: 'magnetic-particle' }
}, { timestamps: true });

magneticParticleInspectionSchema.pre('validate', async function () {
    if (!this.report_no) {
        const year = new Date().getFullYear();
        const prefix = `MPT-${year}-`;

        try {
            // Use the main 'counters' collection for report sequence
            const db = mongoose.connection.db;
            const countersCollection = db.collection('counters');
            
            const counter = await countersCollection.findOneAndUpdate(
                { _id: `mpt_${year}` },
                { $inc: { seq: 1 } },
                { upsert: true, returnDocument: 'after' }
            );

            const nextSeq = counter.value?.seq || 1;
            this.report_no = `${prefix}${nextSeq.toString().padStart(4, '0')}`;
            console.log(`[MPT-GEN] Generated report number: ${this.report_no}`);
        } catch (error) {
            console.error('[MPT] Counter error:', error);
            // Fallback: scan database for highest report number
            const reports = await this.constructor.countDocuments({
                report_no: new RegExp(`^MPT-${new Date().getFullYear()}-`)
            });

            this.report_no = `${prefix}${(reports + 1).toString().padStart(4, '0')}`;
            console.log(`[MPT-GEN-FALLBACK] Generated report number: ${this.report_no}`);
        }
    }
});

module.exports = mongoose.model('MagneticParticleInspection', magneticParticleInspectionSchema);
