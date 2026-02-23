const mongoose = require('mongoose');
const crypto = require('crypto');

const liftInspectionSchema = new mongoose.Schema({
    report_no: {
        type: String
    },
    qr_code_token: {
        type: String,
        default: () => crypto.randomBytes(16).toString('hex')
    },
    client_name: String,
    report_reference: String,
    warehouse_name: String,
    warehouse_address: String,
    inspection_date: { type: Date, default: Date.now }, // Relaxed for generic use
    lift_identification_no: String, // Relaxed for generic use
    manufacturer: String,
    year_of_installation: String,
    rated_load_kg: Number,
    rated_speed_ms: Number,
    number_of_stops: String,
    inspection_types: [String],
    referral_codes: [String],
    lift_types: [String],
    drive_system: String,
    control_system: String,

    // -- New Fields for Enhanced Workflow --
    project_name: String,
    site_location: String,
    priority: {
        type: String,
        enum: ['Low', 'Medium', 'High', 'Urgent'],
        default: 'Medium'
    },
    service_manager: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    inspection_coordinator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    technical_coordinator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    // -- SECTION 2: Reference Details --
    po_number: String,
    rfi_number: String,
    itp_number: String,

    // -- SECTION 3: Scope of Inspection (Boolean Flags) --
    scope_selection: {
        pim: { type: Boolean, default: false },
        mechanical: { type: Boolean, default: false },
        visual: { type: Boolean, default: false },
        dt_witness: { type: Boolean, default: false },
        in_process: { type: Boolean, default: false },
        electrical: { type: Boolean, default: false },
        dimensions: { type: Boolean, default: false },
        ndt_witness: { type: Boolean, default: false },
        final: { type: Boolean, default: false },
        instrumentation: { type: Boolean, default: false },
        painting: { type: Boolean, default: false },
        tpm: { type: Boolean, default: false },
        fat: { type: Boolean, default: false },
        document_review: { type: Boolean, default: false }
    },

    // -- SECTION 4: Inspection Summary --
    summary_result: {
        ncr_issued: { type: String, enum: ['Yes', 'No'], default: 'No' },
        order_completed: { type: String, enum: ['Yes', 'No'], default: 'No' },
        overall_result: { type: String, enum: ['Satisfactory', 'Not Satisfactory', 'Conditional'], default: 'Satisfactory' }
    },

    // -- SECTION 5: Offered Items --
    offered_items: [{
        description: String,
        inspected_qty: Number,
        accepted_qty: Number
    }],

    // -- SECTION 6: Detailed Observations --
    detailed_observation: String, // Rich text content

    // -- SECTION 7: Attendees --
    attendees: [{
        name: String,
        position: String,
        company: String,
        contact: String
    }],

    // -- SECTION 8 & 9: Instruments & Docs --
    referred_documents: [{
        title: String,
        doc_number: String,
        revision_date: String
    }],

    test_instruments: [{
        name: String,
        id_number: String,
        calibration_due: Date
    }],

    // -- SECTION 11: Signatures --
    reviewed_by_client: {
        name: String,
        signature_url: String,
        date: Date
    },

    // Enhanced Photos with Captions
    annotated_photos: [{
        url: String,
        caption: String,
        timestamp: { type: Date, default: Date.now }
    }],

    expected_completion_date: Date,
    sla_duration: String,

    scope_of_work: {
        description: String,
        equipment_name: String,
        quantity: Number,
        drawing_number: String,
        specification_reference: String,
        vendor_name: String
    },

    client_documents: [{
        category: String, // Approved Drawings, Specs, ITP, etc.
        url: String,
        name: String,
        uploaded_at: { type: Date, default: Date.now }
    }],

    custom_checklists: [{
        category: String,
        items: [{
            parameter: String,
            standard_value: String,
            observed_value: String,
            result: { type: String, enum: ['Pass', 'Fail', 'Yes', 'No', 'NA'] },
            remarks: String,
            photo_url: String
        }]
    }],
    // --------------------------------------

    documentation_review: [{
        item: String,
        status: String,
        remarks: String
    }],
    machine_room_inspection: [{
        item: String,
        status: String,
        remarks: String
    }],
    hoistway_inspection: [{
        item: String,
        status: String,
        remarks: String
    }],
    car_landing_inspection: [{
        item: String,
        status: String,
        remarks: String
    }],
    safety_devices_tested: [{
        item: String,
        result: String,
        remarks: String
    }],

    leveling_accuracy: String,
    noise_vibration: String,
    observations: String,
    recommendations: String,
    corrective_action_date: Date,
    inspection_result: {
        type: String,
        enum: ['safe', 'safe_with_action', 'not_safe', '']
    },
    inspector_declaration_confirmed: Boolean,
    inspector_signature_url: String,
    declaration_date: Date,
    photos: [{
        id: String,
        url: String,
        title: String,
        description: String,
        section: String,
        timestamp: String
    }],
    ai_risk_score: Number,
    serviceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Service'
    },
    status: {
        type: String,
        enum: ['draft', 'submitted', 'pending', 'approved', 'rejected'],
        default: 'draft'
    },
    created_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    // Generic fields for Industrial Reports
    formType: String, // e.g., 'mpt', 'ut', 'liquid-penetrant'
    procedure_no: String,
    material_spec: String,
    surface_condition: String,
    surface_temp: String,
    acceptance_std: String,
    welding_process: String,
    test_methods: String,
    instrument_make: String,
    test_technique: String,
    instrument_id: String,
    couplant: String,
    cable_type: String,
    calibration_blocks: [String],
    probes: mongoose.Schema.Types.Mixed,
    scanning_sketch: mongoose.Schema.Types.Mixed,
    lighting_equip: String,
    light_intensity: String,
    instrument_type: [String],
    method: [String],
    current_type: [String],
    contrast: [String],
    thickness: String,
    penetrant_type: String,
    developer_form: String,
    dwell_time: String,
    developing_time: String,
    penetrant_make: String,
    penetrant_batch: String,
    developer_make: String,
    developer_batch: String,
    penetrant_type_check: [String],
    developer_form_check: [String],
    findings_any: String,
    summary_text: String,
    results: [mongoose.Schema.Types.Mixed], // Flexible array for result tables
    // Catch-all for other random fields
    flexibleData: mongoose.Schema.Types.Mixed
}, { strict: false });

// Auto-generate report number
liftInspectionSchema.pre('validate', async function () {
    try {
        if (!this.report_no) {
            const year = new Date().getFullYear();
            const prefix = `LIR-${year}-`;

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
            console.log(`[LIR-GEN] Generated ${this.report_no} (Max was ${maxNum})`);
        }
    } catch (error) {
        console.error('Pre-save Error:', error);
        throw error;
    }
});

module.exports = mongoose.model('LiftInspection', liftInspectionSchema);
