const mongoose = require('mongoose');

const weldingAssessmentAuditSchema = new mongoose.Schema({
    report_no: { type: String, required: true, sparse: true },
    client_name: { type: String, required: true },
    vendor_name: String,
    location: String,
    po_number: String,
    date: { type: Date, default: Date.now },
    serviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Service' },
    created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    formType: { type: String, default: 'welding-assessment-audit' },
    status: { type: String, enum: ['draft', 'submitted'], default: 'draft' },

    // 1. Welding Procedure Qualifications
    wpq_q1: String, wpq_q2: String, wpq_q3: String,
    wpq_score: Number, wpq_observations: String,

    // 2. Procedure Qualification Records (PQR)
    pqr_q1: String, pqr_q2: String, pqr_q3: String,
    pqr_score: Number, pqr_observations: String,

    // 3. Welder Qualification and Continuity
    welder_q1: String, welder_q2: String, welder_q3: String, welder_q4: String, welder_q5: String,
    welder_score: Number, welder_observations: String,

    // 4. Welding Consumables Control
    cons_q1: String, cons_q2: String, cons_q3: String, cons_q4: String,
    cons_score: Number, cons_observations: String,

    // 5. Joint Preparation and Fit-Up
    joint_q1: String, joint_q2: String, joint_q3: String, joint_q4: String,
    joint_score: Number, joint_observations: String,

    // 6. Welding Supervision
    sup_q1: String, sup_q2: String, sup_q3: String, sup_q4: String, sup_q5: String,
    sup_score: Number, sup_observations: String,

    // 7. Inspection and Testing (NDT)
    ndt_q1: String, ndt_q2: String, ndt_q3: String,
    ndt_score: Number, ndt_observations: String,

    // 8. Record and Documentation
    rec_q1: String, rec_q2: String, rec_q3: String, rec_q4: String, rec_q5: String, rec_q6: String, rec_q7: String, rec_q8: String,
    rec_score: Number, rec_observations: String,

    // Conclusion
    overall_score: Number,
    compliance_status: { type: String },
    auditor_remarks: String,

    // Signatures (URLs)
    audited_by_sign: String,
    reviewed_by_sign: String,
    audited_by_name: String,
    reviewed_by_name: String,

    // Photos
    photos: [{
        url: String,
        name: String
    }]
}, { timestamps: true });

weldingAssessmentAuditSchema.pre('validate', async function () {
    if (!this.report_no) {
        const year = new Date().getFullYear();
        const prefix = `WAA-${year}-`;

        try {
            // Use the main 'counters' collection for report sequence
            const db = mongoose.connection.db;
            const countersCollection = db.collection('counters');
            
            const counter = await countersCollection.findOneAndUpdate(
                { _id: `waa_${year}` },
                { $inc: { seq: 1 } },
                { upsert: true, returnDocument: 'after' }
            );

            const nextSeq = counter.value?.seq || 1;
            this.report_no = `${prefix}${nextSeq.toString().padStart(4, '0')}`;
            console.log(`[WAA-GEN] Generated report number: ${this.report_no}`);
        } catch (error) {
            console.error('[WAA] Counter error:', error);
            // Fallback: scan database for highest report number
            const reports = await this.constructor.countDocuments({
                report_no: new RegExp(`^WAA-${new Date().getFullYear()}-`)
            });

            this.report_no = `${prefix}${(reports + 1).toString().padStart(4, '0')}`;
            console.log(`[WAA-GEN-FALLBACK] Generated report number: ${this.report_no}`);
        }
    }
});

module.exports = mongoose.model('WeldingAssessmentAudit', weldingAssessmentAuditSchema);
