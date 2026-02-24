
import {
    ClipboardCheck,
    FileSearch,
    ShieldCheck,
    Activity,
    Ruler,
    Zap,
    FlaskConical,
    Magnet
} from 'lucide-react';

export const reportTemplates = {
    'ultrasonic-test': {
        title: 'ULTRASONIC TEST REPORT',
        subTitle: 'QCWS/NDT/F-02',
        icon: Activity,
        color: 'text-blue-600',
        bg: 'bg-blue-50',
        steps: [
            {
                id: 'header',
                title: 'General Information',
                icon: ClipboardCheck,
                fields: [
                    { id: 'client_name', label: 'CLIENT', type: 'text', placeholder: 'Enter Client Name' },
                    { id: 'report_no', label: 'REPORT NO', type: 'text', placeholder: 'Auto / Manual' },
                    { id: 'vendor_name', label: 'VENDOR', type: 'text', placeholder: 'Enter Vendor Name' },
                    { id: 'date', label: 'DATE', type: 'date' },
                    { id: 'item_tested', label: 'ITEM TESTED', type: 'text', placeholder: 'Description of item' },
                    { id: 'location', label: 'INSPECTION LOCATION', type: 'text', placeholder: 'Site / Factory' }
                ]
            },
            {
                id: 'specs',
                title: 'Technical Specifications',
                icon: FileSearch,
                fields: [
                    { id: 'welding_process', label: 'WELDING PROCESS', type: 'text' },
                    { id: 'material_spec', label: 'MATERIAL SPEC', type: 'text' },
                    { id: 'surface_condition', label: 'SURFACE CONDITION', type: 'text' },
                    { id: 'procedure_no', label: 'PROCEDURE NO', type: 'text' },
                    { id: 'surface_temp', label: 'SURFACE TEMPERATURE', type: 'text' },
                    { id: 'acceptance_std', label: 'ACCEPTANCE STANDARD', type: 'text' }
                ]
            },
            {
                id: 'equipment',
                title: 'Equipment & Technique',
                icon: Zap,
                fields: [
                    { id: 'test_methods', label: 'TEST METHODS', type: 'text' },
                    { id: 'instrument_make', label: 'INSTRUMENT MAKE', type: 'text' },
                    { id: 'test_technique', label: 'TEST TECHNIQUE', type: 'text' },
                    { id: 'instrument_id', label: 'INSTRUMENTS ID', type: 'text' },
                    { id: 'couplant', label: 'TYPE OF COUPLANT', type: 'text' },
                    { id: 'cable_type', label: 'TYPE OF CABLE', type: 'text' }
                ]
            },
            {
                id: 'calibration',
                title: 'Calibration & Probes',
                icon: Ruler,
                fields: [
                    {
                        id: 'calibration_blocks',
                        label: 'CALIBRATION BLOCKS USED',
                        type: 'checkbox_group',
                        options: ['IIW V1', 'V2']
                    },
                    {
                        id: 'probes',
                        label: 'PROBE PARAMETERS',
                        type: 'grid_input',
                        columns: ['0°', '45°', '60°', '70°'],
                        rows: ['Dimension', 'Frequency', 'Reference Gain', 'Range']
                    }
                ]
            },
            {
                id: 'sketch',
                title: 'Scanning Sketch',
                icon: Activity,
                fields: [
                    { id: 'scanning_sketch', label: 'SCANNING SKETCH', type: 'image_upload' }
                ]
            },
            {
                id: 'findings',
                title: 'Final Summary',
                icon: FileSearch,
                fields: [
                    {
                        id: 'summary_text',
                        label: 'REMARKS',
                        type: 'textarea'
                    }
                ]
            },
            {
                id: 'results',
                title: 'Test Results',
                icon: ShieldCheck,
                type: 'dynamic_table',
                columns: [
                    { key: 'item_name', label: 'ITEM NAME / NUMBER', type: 'text' },
                    { key: 'barrage_no', label: 'NUMBER OF BARRAGE', type: 'text' },
                    { key: 'scan_type', label: 'TYPE OF SCANNING', type: 'text' },
                    { key: 'qty', label: 'QTY.', type: 'number' },
                    { key: 'observations', label: 'OBSERVATIONS', type: 'text' },
                    { key: 'result', label: 'RESULT', type: 'select', options: ['Accept', 'Reject'] }
                ]
            }
        ]
    },
    'magnetic-particle': {
        title: 'Magnetic Particle Testing Report',
        subTitle: 'QCWS/NDT/F-01',
        icon: Magnet,
        color: 'text-red-600',
        bg: 'bg-red-50',
        steps: [
            {
                id: 'header',
                title: 'General Information',
                icon: ClipboardCheck,
                fields: [
                    { id: 'client_name', label: 'Client', type: 'text' },
                    { id: 'report_no', label: 'Report No', type: 'text' },
                    { id: 'vendor_name', label: 'Vendor', type: 'text' },
                    { id: 'date', label: 'Date', type: 'date' },
                    { id: 'item_details', label: 'Item Details', type: 'text' },
                    { id: 'location', label: 'Location', type: 'text' }
                ]
            },
            {
                id: 'tech_specs',
                title: 'Technical Specs',
                icon: FileSearch,
                fields: [
                    { id: 'material_spec', label: 'Material Specifications', type: 'text' },
                    { id: 'procedure_no', label: 'Procedure No', type: 'text' },
                    { id: 'thickness', label: 'Thickness', type: 'text' },
                    { id: 'acceptance_std', label: 'Acceptance Standard', type: 'text' }
                ]
            },
            {
                id: 'equipment',
                title: 'Equipment & Parameters',
                icon: Zap,
                fields: [
                    { id: 'lighting_equip', label: 'Lighting Equipment', type: 'text' },
                    { id: 'instrument_make', label: 'Instrument Make', type: 'text' },
                    { id: 'light_intensity', label: 'Light Intensity', type: 'text' },
                    { id: 'instrument_id', label: 'Instruments ID', type: 'text' },
                    {
                        id: 'instrument_type',
                        label: 'Type of Instruments',
                        type: 'checkbox_group',
                        options: ['YOKE', 'PROD']
                    },
                    {
                        id: 'method',
                        label: 'Method',
                        type: 'checkbox_group',
                        options: ['WET', 'DRY']
                    },
                    {
                        id: 'current_type',
                        label: 'Type of Current',
                        type: 'checkbox_group',
                        options: ['AC', 'DC']
                    },
                    {
                        id: 'contrast',
                        label: 'Contrast',
                        type: 'checkbox_group',
                        options: ['YES', 'NO']
                    }
                ]
            },
            {
                id: 'results',
                title: 'Test Results',
                icon: ShieldCheck,
                type: 'dynamic_table',
                columns: [
                    { key: 'item_name', label: 'Item Name', type: 'text' },
                    { key: 'barrage_no', label: 'Number of Barrage', type: 'text' },
                    { key: 'qty', label: 'Qty', type: 'number' },
                    { key: 'observations', label: 'Observations', type: 'text' },
                    { key: 'result', label: 'Result', type: 'select', options: ['Accept', 'Reject'] }
                ]
            }
        ]
    },
    'ndt-summary-report': {
        title: 'NDT Summary Report',
        subTitle: 'QCWS/NDT/SUMMARY',
        icon: Magnet,
        color: 'text-orange-600',
        bg: 'bg-orange-50',
        steps: [
            {
                id: 'header',
                title: 'General Information',
                description: 'Please fill in the details below',
                icon: ClipboardCheck,
                fields: [
                    { id: 'client_name', label: 'CLIENT', type: 'text' },
                    { id: 'report_no', label: 'REPORT NO', type: 'text' },
                    { id: 'vendor_name', label: 'VENDOR', type: 'text' },
                    { id: 'date', label: 'DATE', type: 'date' },
                    { id: 'item_details', label: 'ITEM DETAILS', type: 'text' },
                    { id: 'location', label: 'LOCATION', type: 'text' }
                ]
            },
            {
                id: 'tech_specs',
                title: 'Technical Specs',
                icon: FileSearch,
                fields: [
                    { id: 'material_spec', label: 'MATERIAL SPECIFICATIONS', type: 'text' },
                    { id: 'procedure_no', label: 'PROCEDURE NO', type: 'text' },
                    { id: 'thickness', label: 'THICKNESS', type: 'text' },
                    { id: 'acceptance_std', label: 'ACCEPTANCE STANDARD', type: 'text' }
                ]
            },
            {
                id: 'equipment',
                title: 'Equipment & Parameters',
                icon: Zap,
                fields: [
                    { id: 'lighting_equip', label: 'LIGHTING EQUIPMENT', type: 'text' },
                    { id: 'instrument_make', label: 'INSTRUMENT MAKE', type: 'text' },
                    { id: 'light_intensity', label: 'LIGHT INTENSITY', type: 'text' },
                    { id: 'instrument_id', label: 'INSTRUMENTS ID', type: 'text' },
                    {
                        id: 'instrument_type',
                        label: 'TYPE OF INSTRUMENTS',
                        type: 'checkbox_group',
                        options: ['YOKE', 'PROD']
                    },
                    {
                        id: 'method',
                        label: 'METHOD',
                        type: 'checkbox_group',
                        options: ['WET', 'DRY']
                    },
                    {
                        id: 'current_type',
                        label: 'TYPE OF CURRENT',
                        type: 'checkbox_group',
                        options: ['AC', 'DC']
                    },
                    {
                        id: 'contrast',
                        label: 'CONTRAST',
                        type: 'checkbox_group',
                        options: ['YES', 'NO']
                    }
                ]
            },
            {
                id: 'results',
                title: 'Test Results',
                icon: ShieldCheck,
                type: 'dynamic_table',
                columns: [
                    { key: 'item_name', label: 'ITEM NAME', type: 'text' },
                    { key: 'barrage_no', label: 'NUMBER OF BARRAGE', type: 'text' },
                    { key: 'qty', label: 'QTY', type: 'number' },
                    { key: 'observations', label: 'OBSERVATIONS', type: 'text' },
                    { key: 'result', label: 'RESULT', type: 'select', options: ['Satisfactory', 'Unsatisfactory'] }
                ]
            },
            {
                id: 'findings',
                title: 'Final Summary',
                icon: Activity,
                fields: [
                    {
                        id: 'summary_text',
                        label: 'Summary / Findings',
                        type: 'textarea'
                    }
                ]
            }
        ]
    },
    'liquid-penetrant': {
        title: 'Liquid Penetrant Test',
        subTitle: 'QCWS/NDT/F-01',
        icon: FlaskConical,
        color: 'text-purple-600',
        bg: 'bg-purple-50',
        steps: [
            {
                id: 'header',
                title: 'General Information',
                description: 'Please fill in the details below',
                icon: ClipboardCheck,
                fields: [
                    { id: 'client_name', label: 'Client', type: 'text' },
                    // { id: 'report_no', label: 'Report No', type: 'text' }, // Removed from UI as per request
                    { id: 'vendor_name', label: 'Vendor', type: 'text' },
                    { id: 'date', label: 'Date', type: 'date' },
                    { id: 'item', label: 'Item', type: 'text' },
                    { id: 'location', label: 'Inspection Location', type: 'text' }
                ]
            },
            {
                id: 'process',
                title: 'Process Info',
                icon: FileSearch,
                fields: [
                    { id: 'procedure_no', label: 'Procedure No', type: 'text' },
                    { id: 'penetrant_type', label: 'Type Of Penetrant', type: 'text' },
                    { id: 'acceptance_std', label: 'Acceptance Standard', type: 'text' },
                    { id: 'developer_form', label: 'Developer Form', type: 'text' }
                ]
            },
            {
                id: 'consumables',
                title: 'Consumables',
                icon: FlaskConical,
                fields: [
                    { id: 'penetrant_make', label: 'Penetrant Make', type: 'text' },
                    { id: 'penetrant_batch', label: 'Penetrant Batch', type: 'text' },
                    {
                        id: 'penetrant_type_check',
                        label: 'Penetrant Type',
                        type: 'checkbox_group',
                        options: ['Florescent', 'Non Florescent']
                    },
                    { id: 'developer_make', label: 'Developer Make', type: 'text' },
                    { id: 'developer_batch', label: 'Developer Batch', type: 'text' },
                    {
                        id: 'developer_form_check',
                        label: 'Developer Form',
                        type: 'checkbox_group',
                        options: ['Wet', 'Dry']
                    }
                ]
            },
            {
                id: 'parameters',
                title: 'Test Parameters',
                icon: Zap,
                fields: [
                    { id: 'surface_temp', label: 'Surface Temp', type: 'text' },
                    { id: 'dwell_time', label: 'Dwell Time', type: 'text' },
                    { id: 'light_intensity', label: 'Light Intensity', type: 'text' },
                    { id: 'developing_time', label: 'Developing Time', type: 'text' }
                ]
            },
            {
                id: 'results',
                title: 'Test Results',
                icon: ShieldCheck,
                type: 'dynamic_table',
                columns: [
                    { key: 'item_name', label: 'Item Name / Number', type: 'text' },
                    { key: 'observations', label: 'Observations', type: 'text' },
                    { key: 'result', label: 'Result', type: 'select', options: ['Accept', 'Reject'] }
                ]
            },
            {
                id: 'findings',
                title: 'Findings',
                fields: [
                    { id: 'findings_any', label: 'Findings If Any', type: 'textarea' }
                ]
            }
        ]
    },

    // ─── TPI REPORT TEMPLATES ─────────────────────────────────────────────────

    'pim': {
        title: 'Pre-Inspection Meeting (PIM)',
        subTitle: 'TPI/PIM',
        icon: ClipboardCheck,
        color: 'text-blue-600',
        bg: 'bg-blue-50',
        steps: [
            {
                id: 'header',
                title: 'Meeting Details',
                icon: ClipboardCheck,
                fields: [
                    { id: 'client_name', label: 'Client / Company', type: 'text', placeholder: 'Client Name' },
                    { id: 'report_no', label: 'Report No', type: 'text', placeholder: 'Auto / Manual' },
                    { id: 'date', label: 'Date', type: 'date' },
                    { id: 'location', label: 'Meeting Location', type: 'text', placeholder: 'Office / Site / Online' },
                    { id: 'po_number', label: 'PO Number', type: 'text', placeholder: 'Purchase Order No' },
                    { id: 'project_name', label: 'Project / Item', type: 'text', placeholder: 'Project Description' }
                ]
            },
            {
                id: 'attendees',
                title: 'Attendees',
                icon: ClipboardCheck,
                type: 'dynamic_table',
                columns: [
                    { key: 'name', label: 'Name', type: 'text' },
                    { key: 'company', label: 'Company', type: 'text' },
                    { key: 'designation', label: 'Designation', type: 'text' },
                    { key: 'signature', label: 'Signature', type: 'text' }
                ]
            },
            {
                id: 'agenda',
                title: 'Agenda & Discussion Points',
                icon: ClipboardCheck,
                type: 'dynamic_table',
                columns: [
                    { key: 'item_no', label: '#', type: 'text' },
                    { key: 'topic', label: 'Topic Discussed', type: 'text' },
                    { key: 'remarks', label: 'Remarks / Decision', type: 'text' }
                ]
            },
            {
                id: 'actions',
                title: 'Action Items',
                icon: ClipboardCheck,
                type: 'dynamic_table',
                columns: [
                    { key: 'action', label: 'Action Required', type: 'text' },
                    { key: 'responsible', label: 'Responsible Party', type: 'text' },
                    { key: 'target_date', label: 'Target Date', type: 'text' },
                    { key: 'status', label: 'Status', type: 'select', options: ['Open', 'Closed', 'In Progress'] }
                ]
            },
            {
                id: 'summary',
                title: 'Summary & Next Steps',
                icon: ClipboardCheck,
                fields: [
                    { id: 'summary_notes', label: 'Meeting Summary', type: 'textarea', placeholder: 'Key outcomes...' },
                    { id: 'next_meeting_date', label: 'Next Meeting Date', type: 'date' },
                    { id: 'next_meeting_location', label: 'Next Meeting Location', type: 'text' }
                ]
            }
        ]
    },

    'itp-review': {
        title: 'ITP Review Report',
        subTitle: 'TPI/ITP',
        icon: ClipboardCheck,
        color: 'text-blue-600',
        bg: 'bg-blue-50',
        steps: [
            {
                id: 'header',
                title: 'General Information',
                icon: ClipboardCheck,
                fields: [
                    { id: 'client_name', label: 'Client', type: 'text' },
                    { id: 'report_no', label: 'Report No', type: 'text' },
                    { id: 'date', label: 'Date', type: 'date' },
                    { id: 'vendor_name', label: 'Vendor / Manufacturer', type: 'text' },
                    { id: 'itp_ref', label: 'ITP Reference No', type: 'text' },
                    { id: 'revision_no', label: 'Revision No', type: 'text' },
                    { id: 'project_name', label: 'Project / PO No', type: 'text' },
                    { id: 'scope', label: 'Scope of Review', type: 'textarea' }
                ]
            },
            {
                id: 'review_items',
                title: 'ITP Review Checklist',
                icon: ClipboardCheck,
                type: 'dynamic_table',
                columns: [
                    { key: 'activity', label: 'Inspection Activity', type: 'text' },
                    { key: 'document_ref', label: 'Document Ref', type: 'text' },
                    { key: 'hold_witness', label: 'H/W/R', type: 'select', options: ['H', 'W', 'R', 'MR'] },
                    { key: 'accepted', label: 'Accepted', type: 'select', options: ['Yes', 'No', 'N/A'] },
                    { key: 'comments', label: 'Comments', type: 'text' }
                ]
            },
            {
                id: 'conclusion',
                title: 'Conclusion',
                icon: ClipboardCheck,
                fields: [
                    { id: 'overall_status', label: 'Overall ITP Status', type: 'select', options: ['Approved', 'Approved with Comments', 'Rejected'] },
                    { id: 'comments', label: 'Reviewer Comments', type: 'textarea' }
                ]
            }
        ]
    },

    'raw-material': {
        title: 'Raw Material Inspection',
        subTitle: 'TPI/RMI',
        icon: ClipboardCheck,
        color: 'text-blue-600',
        bg: 'bg-blue-50',
        steps: [
            {
                id: 'header',
                title: 'General Information',
                icon: ClipboardCheck,
                fields: [
                    { id: 'client_name', label: 'Client', type: 'text' },
                    { id: 'report_no', label: 'Report No', type: 'text' },
                    { id: 'date', label: 'Date', type: 'date' },
                    { id: 'vendor_name', label: 'Vendor / Supplier', type: 'text' },
                    { id: 'location', label: 'Inspection Location', type: 'text' },
                    { id: 'po_number', label: 'PO Number', type: 'text' },
                    { id: 'material_type', label: 'Material Type', type: 'text' },
                    { id: 'heat_no', label: 'Heat / Batch No', type: 'text' },
                    { id: 'cert_no', label: 'Material Certificate No', type: 'text' },
                    { id: 'quantity', label: 'Quantity Inspected', type: 'text' }
                ]
            },
            {
                id: 'inspection',
                title: 'Inspection Results',
                icon: ClipboardCheck,
                type: 'dynamic_table',
                columns: [
                    { key: 'parameter', label: 'Parameter Checked', type: 'text' },
                    { key: 'required', label: 'Required Value', type: 'text' },
                    { key: 'actual', label: 'Actual Value', type: 'text' },
                    { key: 'result', label: 'Result', type: 'select', options: ['Accept', 'Reject', 'N/A'] }
                ]
            },
            {
                id: 'conclusion',
                title: 'Conclusion',
                icon: ClipboardCheck,
                fields: [
                    { id: 'overall_result', label: 'Overall Result', type: 'select', options: ['Accepted', 'Rejected', 'Hold'] },
                    { id: 'remarks', label: 'Remarks', type: 'textarea' }
                ]
            }
        ]
    },

    'in-process': {
        title: 'In-Process Inspection',
        subTitle: 'TPI/IPI',
        icon: ClipboardCheck,
        color: 'text-blue-600',
        bg: 'bg-blue-50',
        steps: [
            {
                id: 'header',
                title: 'General Information',
                icon: ClipboardCheck,
                fields: [
                    { id: 'client_name', label: 'Client', type: 'text' },
                    { id: 'report_no', label: 'Report No', type: 'text' },
                    { id: 'date', label: 'Date', type: 'date' },
                    { id: 'vendor_name', label: 'Vendor / Manufacturer', type: 'text' },
                    { id: 'location', label: 'Inspection Location', type: 'text' },
                    { id: 'po_number', label: 'PO Number', type: 'text' },
                    { id: 'stage', label: 'Manufacturing Stage', type: 'text', placeholder: 'e.g. Assembly, Fabrication' },
                    { id: 'drawing_no', label: 'Drawing / Spec No', type: 'text' }
                ]
            },
            {
                id: 'inspection',
                title: 'Inspection Checklist',
                icon: ClipboardCheck,
                type: 'dynamic_table',
                columns: [
                    { key: 'parameter', label: 'Parameter', type: 'text' },
                    { key: 'required', label: 'Requirement', type: 'text' },
                    { key: 'actual', label: 'Actual', type: 'text' },
                    { key: 'result', label: 'Result', type: 'select', options: ['Accept', 'Reject', 'N/A'] },
                    { key: 'remarks', label: 'Remarks', type: 'text' }
                ]
            },
            {
                id: 'conclusion',
                title: 'Conclusion',
                icon: ClipboardCheck,
                fields: [
                    { id: 'overall_result', label: 'Overall Result', type: 'select', options: ['Accepted', 'Rejected', 'Hold for Correction'] },
                    { id: 'remarks', label: 'Remarks', type: 'textarea' }
                ]
            }
        ]
    },

    'welding': {
        title: 'Welding Inspection',
        subTitle: 'TPI/WI',
        icon: ClipboardCheck,
        color: 'text-blue-600',
        bg: 'bg-blue-50',
        steps: [
            {
                id: 'header',
                title: 'General Information',
                icon: ClipboardCheck,
                fields: [
                    { id: 'client_name', label: 'Client', type: 'text' },
                    { id: 'report_no', label: 'Report No', type: 'text' },
                    { id: 'date', label: 'Date', type: 'date' },
                    { id: 'vendor_name', label: 'Vendor / Manufacturer', type: 'text' },
                    { id: 'location', label: 'Inspection Location', type: 'text' },
                    { id: 'po_number', label: 'PO Number', type: 'text' },
                    { id: 'weld_joint', label: 'Weld Joint ID', type: 'text' },
                    { id: 'wps_ref', label: 'WPS Reference', type: 'text' },
                    { id: 'welder_id', label: 'Welder ID / Stamp', type: 'text' },
                    { id: 'process', label: 'Welding Process', type: 'text', placeholder: 'SMAW / GTAW / GMAW...' }
                ]
            },
            {
                id: 'inspection',
                title: 'Weld Inspection Checklist',
                icon: ClipboardCheck,
                type: 'dynamic_table',
                columns: [
                    { key: 'joint_no', label: 'Joint No', type: 'text' },
                    { key: 'visual_result', label: 'Visual Result', type: 'select', options: ['Accept', 'Reject'] },
                    { key: 'dimension_result', label: 'Dimensional Result', type: 'select', options: ['Accept', 'Reject', 'N/A'] },
                    { key: 'remarks', label: 'Remarks', type: 'text' }
                ]
            },
            {
                id: 'conclusion',
                title: 'Conclusion',
                icon: ClipboardCheck,
                fields: [
                    { id: 'overall_result', label: 'Overall Result', type: 'select', options: ['Accepted', 'Rejected', 'Repair Required'] },
                    { id: 'remarks', label: 'Remarks', type: 'textarea' }
                ]
            }
        ]
    },

    'ndt-witness': {
        title: 'NDT Witness Report',
        subTitle: 'TPI/NDT-W',
        icon: ClipboardCheck,
        color: 'text-blue-600',
        bg: 'bg-blue-50',
        steps: [
            {
                id: 'header',
                title: 'General Information',
                icon: ClipboardCheck,
                fields: [
                    { id: 'client_name', label: 'Client', type: 'text' },
                    { id: 'report_no', label: 'Report No', type: 'text' },
                    { id: 'date', label: 'Date', type: 'date' },
                    { id: 'vendor_name', label: 'Vendor / NDT Contractor', type: 'text' },
                    { id: 'location', label: 'Inspection Location', type: 'text' },
                    { id: 'ndt_type', label: 'NDT Method', type: 'select', options: ['UT', 'RT', 'MT', 'PT', 'VT', 'ET'] },
                    { id: 'procedure_ref', label: 'Procedure Reference', type: 'text' },
                    { id: 'operator_name', label: 'NDT Operator Name', type: 'text' },
                    { id: 'operator_cert', label: 'Operator Certification Level', type: 'text' }
                ]
            },
            {
                id: 'witness',
                title: 'Witnessed Items',
                icon: ClipboardCheck,
                type: 'dynamic_table',
                columns: [
                    { key: 'item_id', label: 'Item / Joint ID', type: 'text' },
                    { key: 'area_tested', label: 'Area Tested', type: 'text' },
                    { key: 'technique', label: 'Technique', type: 'text' },
                    { key: 'result', label: 'Result', type: 'select', options: ['Accept', 'Reject'] },
                    { key: 'remarks', label: 'Remarks', type: 'text' }
                ]
            },
            {
                id: 'conclusion',
                title: 'Conclusion',
                icon: ClipboardCheck,
                fields: [
                    { id: 'overall_result', label: 'Overall Witness Result', type: 'select', options: ['Satisfactory', 'Unsatisfactory'] },
                    { id: 'remarks', label: 'Inspector Remarks', type: 'textarea' }
                ]
            }
        ]
    },

    'dimensional': {
        title: 'Dimensional Inspection',
        subTitle: 'TPI/DIM',
        icon: ClipboardCheck,
        color: 'text-blue-600',
        bg: 'bg-blue-50',
        steps: [
            {
                id: 'header',
                title: 'General Information',
                icon: ClipboardCheck,
                fields: [
                    { id: 'client_name', label: 'Client', type: 'text' },
                    { id: 'report_no', label: 'Report No', type: 'text' },
                    { id: 'date', label: 'Date', type: 'date' },
                    { id: 'vendor_name', label: 'Vendor / Manufacturer', type: 'text' },
                    { id: 'location', label: 'Inspection Location', type: 'text' },
                    { id: 'po_number', label: 'PO Number', type: 'text' },
                    { id: 'drawing_no', label: 'Drawing No', type: 'text' },
                    { id: 'component_name', label: 'Component / Item Name', type: 'text' },
                    { id: 'instrument_used', label: 'Measuring Instrument Used', type: 'text' }
                ]
            },
            {
                id: 'measurements',
                title: 'Dimensional Measurements',
                icon: ClipboardCheck,
                type: 'dynamic_table',
                columns: [
                    { key: 'parameter', label: 'Parameter', type: 'text' },
                    { key: 'required', label: 'Required (mm)', type: 'text' },
                    { key: 'tolerance', label: 'Tolerance (±)', type: 'text' },
                    { key: 'actual', label: 'Actual (mm)', type: 'text' },
                    { key: 'result', label: 'Result', type: 'select', options: ['Accept', 'Reject'] }
                ]
            },
            {
                id: 'conclusion',
                title: 'Conclusion',
                icon: ClipboardCheck,
                fields: [
                    { id: 'overall_result', label: 'Overall Result', type: 'select', options: ['Accepted', 'Rejected', 'Conditional Accept'] },
                    { id: 'remarks', label: 'Remarks', type: 'textarea' }
                ]
            }
        ]
    },

    'hydro-test': {
        title: 'Hydro Test Report',
        subTitle: 'TPI/HT',
        icon: ClipboardCheck,
        color: 'text-blue-600',
        bg: 'bg-blue-50',
        steps: [
            {
                id: 'header',
                title: 'General Information',
                icon: ClipboardCheck,
                fields: [
                    { id: 'client_name', label: 'Client', type: 'text' },
                    { id: 'report_no', label: 'Report No', type: 'text' },
                    { id: 'date', label: 'Date', type: 'date' },
                    { id: 'vendor_name', label: 'Vendor / Manufacturer', type: 'text' },
                    { id: 'location', label: 'Inspection Location', type: 'text' },
                    { id: 'po_number', label: 'PO Number', type: 'text' },
                    { id: 'item_desc', label: 'Item / Equipment Description', type: 'text' },
                    { id: 'item_no', label: 'Item / Tag No', type: 'text' }
                ]
            },
            {
                id: 'test_params',
                title: 'Test Parameters',
                icon: ClipboardCheck,
                fields: [
                    { id: 'test_medium', label: 'Test Medium', type: 'text', placeholder: 'e.g. Water' },
                    { id: 'design_pressure', label: 'Design Pressure (bar)', type: 'text' },
                    { id: 'test_pressure', label: 'Test Pressure (bar)', type: 'text' },
                    { id: 'hold_time', label: 'Hold Duration (minutes)', type: 'text' },
                    { id: 'test_temp', label: 'Test Temperature (°C)', type: 'text' },
                    { id: 'pressurization_rate', label: 'Pressurization Rate', type: 'text' },
                    { id: 'gauge_id', label: 'Pressure Gauge ID', type: 'text' },
                    { id: 'gauge_calib', label: 'Gauge Calibration Due Date', type: 'date' }
                ]
            },
            {
                id: 'results',
                title: 'Test Results',
                icon: ClipboardCheck,
                fields: [
                    { id: 'pressure_achieved', label: 'Pressure Achieved (bar)', type: 'text' },
                    { id: 'leakage_observed', label: 'Leakage Observed?', type: 'select', options: ['No', 'Yes'] },
                    { id: 'deformation_observed', label: 'Deformation Observed?', type: 'select', options: ['No', 'Yes'] },
                    { id: 'overall_result', label: 'Overall Result', type: 'select', options: ['Pass', 'Fail'] },
                    { id: 'remarks', label: 'Remarks', type: 'textarea' }
                ]
            }
        ]
    },

    'fat': {
        title: 'FAT Report',
        subTitle: 'TPI/FAT',
        icon: ClipboardCheck,
        color: 'text-blue-600',
        bg: 'bg-blue-50',
        steps: [
            {
                id: 'header',
                title: 'General Information',
                icon: ClipboardCheck,
                fields: [
                    { id: 'client_name', label: 'Client', type: 'text' },
                    { id: 'report_no', label: 'Report No', type: 'text' },
                    { id: 'date', label: 'Date', type: 'date' },
                    { id: 'vendor_name', label: 'Manufacturer / Vendor', type: 'text' },
                    { id: 'location', label: 'Test Location (Factory)', type: 'text' },
                    { id: 'po_number', label: 'PO Number', type: 'text' },
                    { id: 'equipment_name', label: 'Equipment Name', type: 'text' },
                    { id: 'equipment_tag', label: 'Equipment Tag No', type: 'text' },
                    { id: 'serial_no', label: 'Serial No', type: 'text' }
                ]
            },
            {
                id: 'checklist',
                title: 'FAT Checklist',
                icon: ClipboardCheck,
                type: 'dynamic_table',
                columns: [
                    { key: 'test_item', label: 'Test / Check Item', type: 'text' },
                    { key: 'method', label: 'Method', type: 'text' },
                    { key: 'acceptance_criteria', label: 'Acceptance Criteria', type: 'text' },
                    { key: 'result', label: 'Result', type: 'select', options: ['Pass', 'Fail', 'N/A'] },
                    { key: 'remarks', label: 'Remarks', type: 'text' }
                ]
            },
            {
                id: 'conclusion',
                title: 'FAT Conclusion',
                icon: ClipboardCheck,
                fields: [
                    { id: 'overall_result', label: 'FAT Result', type: 'select', options: ['Passed', 'Failed', 'Passed with Conditions'] },
                    { id: 'punch_items', label: 'Punch List Items (if any)', type: 'textarea' },
                    { id: 'remarks', label: 'Final Remarks', type: 'textarea' }
                ]
            }
        ]
    },

    'final': {
        title: 'Final Inspection',
        subTitle: 'TPI/FI',
        icon: ClipboardCheck,
        color: 'text-blue-600',
        bg: 'bg-blue-50',
        steps: [
            {
                id: 'header',
                title: 'General Information',
                icon: ClipboardCheck,
                fields: [
                    { id: 'client_name', label: 'Client', type: 'text' },
                    { id: 'report_no', label: 'Report No', type: 'text' },
                    { id: 'date', label: 'Date', type: 'date' },
                    { id: 'vendor_name', label: 'Vendor / Manufacturer', type: 'text' },
                    { id: 'location', label: 'Inspection Location', type: 'text' },
                    { id: 'po_number', label: 'PO Number', type: 'text' },
                    { id: 'item_desc', label: 'Item / Equipment Description', type: 'text' },
                    { id: 'quantity', label: 'Quantity', type: 'text' }
                ]
            },
            {
                id: 'checklist',
                title: 'Final Inspection Checklist',
                icon: ClipboardCheck,
                type: 'dynamic_table',
                columns: [
                    { key: 'item', label: 'Inspection Item', type: 'text' },
                    { key: 'document_ref', label: 'Document Ref', type: 'text' },
                    { key: 'result', label: 'Result', type: 'select', options: ['Accept', 'Reject', 'N/A'] },
                    { key: 'remarks', label: 'Remarks', type: 'text' }
                ]
            },
            {
                id: 'conclusion',
                title: 'Conclusion',
                icon: ClipboardCheck,
                fields: [
                    { id: 'overall_result', label: 'Overall Result', type: 'select', options: ['Released', 'Rejected', 'Hold'] },
                    { id: 'remarks', label: 'Remarks', type: 'textarea' }
                ]
            }
        ]
    },

    'pre-dispatch': {
        title: 'Pre-Dispatch Inspection',
        subTitle: 'TPI/PDI',
        icon: ClipboardCheck,
        color: 'text-blue-600',
        bg: 'bg-blue-50',
        steps: [
            {
                id: 'header',
                title: 'General Information',
                icon: ClipboardCheck,
                fields: [
                    { id: 'client_name', label: 'Client', type: 'text' },
                    { id: 'report_no', label: 'Report No', type: 'text' },
                    { id: 'date', label: 'Date', type: 'date' },
                    { id: 'vendor_name', label: 'Vendor / Supplier', type: 'text' },
                    { id: 'location', label: 'Inspection Location', type: 'text' },
                    { id: 'po_number', label: 'PO Number', type: 'text' },
                    { id: 'item_desc', label: 'Item Description', type: 'text' },
                    { id: 'quantity', label: 'Quantity', type: 'text' },
                    { id: 'destination', label: 'Destination', type: 'text' }
                ]
            },
            {
                id: 'inspection',
                title: 'Pre-Dispatch Checklist',
                icon: ClipboardCheck,
                type: 'dynamic_table',
                columns: [
                    { key: 'check_item', label: 'Check Item', type: 'text' },
                    { key: 'required', label: 'Requirement', type: 'text' },
                    { key: 'actual', label: 'Actual Observation', type: 'text' },
                    { key: 'result', label: 'Result', type: 'select', options: ['OK', 'Not OK', 'N/A'] }
                ]
            },
            {
                id: 'conclusion',
                title: 'Conclusion',
                icon: ClipboardCheck,
                fields: [
                    { id: 'packing_condition', label: 'Packing Condition', type: 'select', options: ['Satisfactory', 'Unsatisfactory'] },
                    { id: 'marking_labeling', label: 'Marking & Labeling', type: 'select', options: ['OK', 'Not OK'] },
                    { id: 'overall_result', label: 'Overall Result', type: 'select', options: ['Released for Dispatch', 'Hold', 'Rejected'] },
                    { id: 'remarks', label: 'Remarks', type: 'textarea' }
                ]
            }
        ]
    },

    'release-note': {
        title: 'Release Note',
        subTitle: 'TPI/RN',
        icon: ClipboardCheck,
        color: 'text-blue-600',
        bg: 'bg-blue-50',
        steps: [
            {
                id: 'header',
                title: 'Release Details',
                icon: ClipboardCheck,
                fields: [
                    { id: 'client_name', label: 'Client', type: 'text' },
                    { id: 'report_no', label: 'Release Note No', type: 'text' },
                    { id: 'date', label: 'Date', type: 'date' },
                    { id: 'vendor_name', label: 'Vendor / Manufacturer', type: 'text' },
                    { id: 'po_number', label: 'PO Number', type: 'text' },
                    { id: 'item_desc', label: 'Item / Material Description', type: 'text' },
                    { id: 'quantity', label: 'Quantity Released', type: 'text' },
                    { id: 'cert_refs', label: 'Certificate References', type: 'textarea', placeholder: 'Mill certs, test reports, etc.' },
                    { id: 'authorized_by', label: 'Authorized By', type: 'text' },
                    { id: 'remarks', label: 'Remarks / Conditions', type: 'textarea' }
                ]
            }
        ]
    },

    'ncr': {
        title: 'Non-Conformance Report (NCR)',
        subTitle: 'TPI/NCR',
        icon: ClipboardCheck,
        color: 'text-red-600',
        bg: 'bg-red-50',
        steps: [
            {
                id: 'header',
                title: 'NCR Details',
                icon: ClipboardCheck,
                fields: [
                    { id: 'client_name', label: 'Client', type: 'text' },
                    { id: 'report_no', label: 'NCR No', type: 'text' },
                    { id: 'date', label: 'Date Raised', type: 'date' },
                    { id: 'vendor_name', label: 'Vendor / Responsible Party', type: 'text' },
                    { id: 'location', label: 'Location / Stage', type: 'text' },
                    { id: 'po_number', label: 'PO Number', type: 'text' },
                    { id: 'item_desc', label: 'Item / Component', type: 'text' }
                ]
            },
            {
                id: 'nonconformance',
                title: 'Non-Conformance Details',
                icon: ClipboardCheck,
                fields: [
                    { id: 'description', label: 'Description of Non-Conformance', type: 'textarea' },
                    { id: 'severity', label: 'Severity', type: 'select', options: ['Major', 'Minor', 'Observation'] },
                    { id: 'requirement_ref', label: 'Requirement / Standard Reference', type: 'text' },
                    { id: 'qty_affected', label: 'Quantity Affected', type: 'text' }
                ]
            },
            {
                id: 'disposition',
                title: 'Disposition & Actions',
                icon: ClipboardCheck,
                fields: [
                    { id: 'root_cause', label: 'Root Cause', type: 'textarea' },
                    { id: 'disposition', label: 'Disposition', type: 'select', options: ['Repair', 'Rework', 'Reject / Scrap', 'Use As Is', 'Return to Vendor'] },
                    { id: 'corrective_action', label: 'Corrective Action', type: 'textarea' },
                    { id: 'closure_date', label: 'Target Closure Date', type: 'date' },
                    { id: 'status', label: 'NCR Status', type: 'select', options: ['Open', 'Closed', 'Pending Verification'] }
                ]
            }
        ]
    },

    'car': {
        title: 'Corrective Action Report (CAR)',
        subTitle: 'TPI/CAR',
        icon: ClipboardCheck,
        color: 'text-orange-600',
        bg: 'bg-orange-50',
        steps: [
            {
                id: 'header',
                title: 'CAR Details',
                icon: ClipboardCheck,
                fields: [
                    { id: 'client_name', label: 'Client', type: 'text' },
                    { id: 'report_no', label: 'CAR No', type: 'text' },
                    { id: 'date', label: 'Date Issued', type: 'date' },
                    { id: 'vendor_name', label: 'Issued To (Vendor)', type: 'text' },
                    { id: 'ncr_ref', label: 'NCR Reference No', type: 'text' },
                    { id: 'po_number', label: 'PO Number', type: 'text' }
                ]
            },
            {
                id: 'analysis',
                title: 'Problem Analysis',
                icon: ClipboardCheck,
                fields: [
                    { id: 'problem_description', label: 'Problem Description', type: 'textarea' },
                    { id: 'root_cause', label: 'Root Cause Analysis', type: 'textarea' },
                    { id: 'immediate_action', label: 'Immediate / Containment Action', type: 'textarea' }
                ]
            },
            {
                id: 'corrective',
                title: 'Corrective Action Plan',
                icon: ClipboardCheck,
                type: 'dynamic_table',
                columns: [
                    { key: 'action', label: 'Corrective Action', type: 'text' },
                    { key: 'responsible', label: 'Responsible', type: 'text' },
                    { key: 'target_date', label: 'Target Date', type: 'text' },
                    { key: 'status', label: 'Status', type: 'select', options: ['Open', 'In Progress', 'Completed'] }
                ]
            },
            {
                id: 'closure',
                title: 'Closure',
                icon: ClipboardCheck,
                fields: [
                    { id: 'verification_method', label: 'Verification Method', type: 'text' },
                    { id: 'closure_date', label: 'Closure Date', type: 'date' },
                    { id: 'status', label: 'CAR Status', type: 'select', options: ['Open', 'Closed', 'Awaiting Verification'] },
                    { id: 'remarks', label: 'Remarks', type: 'textarea' }
                ]
            }
        ]
    },

    'engineering-inspection': {
        title: 'Engineering Inspection',
        subTitle: 'TPI/EI',
        icon: ClipboardCheck,
        color: 'text-blue-600',
        bg: 'bg-blue-50',
        steps: [
            {
                id: 'header',
                title: 'General Information',
                icon: ClipboardCheck,
                fields: [
                    { id: 'client_name', label: 'CLIENT:', type: 'text' },
                    { id: 'report_no', label: 'REPORT#:', type: 'text' },
                    { id: 'date', label: 'DATE:', type: 'date' },
                    { id: 'vendor_name', label: 'VENDOR:', type: 'text' },
                    { id: 'location', label: 'INSPECTION LOCATION:', type: 'text' },
                    { id: 'project_name', label: 'PROJECT:', type: 'text', placeholder: 'Enter Project Name' },
                    { id: 'po_number', label: 'PO#:', type: 'text' },
                    { id: 'rfi_number', label: 'RFI / NOTIFICATION #:', type: 'text' },
                    { id: 'itp_qap_number', label: 'ITP/QAP#:', type: 'text' },
                    { id: 'inspection_date', label: 'DATE OF INSPECTION#:', type: 'date' },
                ]
            },
            {
                id: 'scope_section',
                title: 'SCOPE OF INSECTION',
                icon: ClipboardCheck,
                fields: [
                    {
                        id: 'scope_selection',
                        label: 'SELECT SCOPE:',
                        type: 'checkbox_group',
                        options: ['PIM', 'IN PROCESS', 'FINAL', 'MECHANICAL', 'ELECTRICAL', 'INSTRUMENTATION', 'Visual', 'Dimensions', 'Painting', 'Document review', 'DT Witness', 'NDT Witness', 'TPM', 'FAT']
                    }
                ]
            },
            {
                id: 'summary',
                title: 'INSPECTION SUMMARY',
                icon: ClipboardCheck,
                fields: [
                    { id: 'ncr_issued', label: 'Non-Conformity Report Issued During This Visit:', type: 'select', options: ['No', 'Yes'] },
                    { id: 'order_completed', label: 'Order Completed:', type: 'select', options: ['No', 'Yes'] },
                    { id: 'overall_result', label: 'Result:', type: 'select', options: ['Satisfactory', 'Not Satisfactory', 'Conditional'] }
                ]
            },
            {
                id: 'offered_items',
                title: 'Offered Items',
                icon: ClipboardCheck,
                type: 'dynamic_table',
                columns: [
                    { key: 'sr_no', label: 'SR. NO.', type: 'text' },
                    { key: 'description', label: 'ITEM DESCRIPTION', type: 'text' },
                    { key: 'inspected_qty', label: 'INSPECTED QTY.', type: 'text' },
                    { key: 'accepted_qty', label: 'ACCEPTED QTY.', type: 'text' }
                ]
            },
            {
                id: 'inspection_details',
                title: 'Inspection Details',
                icon: ClipboardCheck,
                fields: [
                    {
                        id: 'detailed_observation',
                        label: 'Findings and Observations',
                        type: 'textarea',
                        placeholder: 'Inspection Carried out as per notification & referral docs...\n- Visual inspection carried out...',
                        defaultValue: 'Inspection Carried out as per notification & referral docs, inspection result found as below details.\n- Visual inspection carried out of fire lines, verified layout as per drawing & found in order, no defect or damage observed.\n- Hydro test witnessed of above items at test pressure (450 Kg/Cm2), no leakage or pressure drop observed during holding time, test result found satisfactory.'
                    }
                ]
            },
            {
                id: 'attendees',
                title: 'Attendees',
                icon: ClipboardCheck,
                type: 'dynamic_table',
                columns: [
                    { key: 'name', label: 'NAME', type: 'text' },
                    { key: 'position', label: 'POSITION', type: 'text' },
                    { key: 'company', label: 'COMPANY NAME', type: 'text' },
                    { key: 'contact', label: 'CONTACT NO', type: 'text' }
                ]
            },
            {
                id: 'referred_docs',
                title: 'Referred Documents',
                icon: ClipboardCheck,
                type: 'dynamic_table',
                columns: [
                    { key: 'sr_no', label: 'SR NO.', type: 'text' },
                    { key: 'title', label: 'DOCUMENT TITLE', type: 'text' },
                    { key: 'doc_no', label: 'DOCUMENT NO', type: 'text' },
                    { key: 'rev_edd', label: 'REV/ EDD', type: 'text' }
                ]
            },
            {
                id: 'test_instruments',
                title: 'Test Instruments Used',
                icon: ClipboardCheck,
                type: 'dynamic_table',
                columns: [
                    { key: 'sr_no', label: 'SR NO', type: 'text' },
                    { key: 'name', label: 'INSTRUMENTS NAME', type: 'text' },
                    { key: 'id_number', label: 'INSTRUMENT ID', type: 'text' },
                    { key: 'calibration_due', label: 'CALIBRATION DUE DATE', type: 'text' }
                ]
            },
            {
                id: 'docs_attached',
                title: 'Document Attached',
                icon: ClipboardCheck,
                type: 'dynamic_table',
                columns: [
                    { key: 'sr_no', label: 'SR NO', type: 'text' },
                    { key: 'title', label: 'DOCUMENTS TITLE', type: 'text' }
                ]
            },
            {
                id: 'signatures',
                title: 'Signatures',
                icon: ClipboardCheck,
                fields: [
                    { id: 'inspector_date', label: 'Inspector Date', type: 'date' },
                    { id: 'client_date', label: 'Client Date', type: 'date' }
                ]
            }
        ]
    },

    'welding-assessment-audit': {
        title: 'Welding Assessment Audit Report',
        subTitle: 'QCWS/WC/F-11',
        icon: ClipboardCheck,
        color: 'text-rose-600',
        bg: 'bg-rose-50',
        steps: [
            {
                id: 'header',
                title: 'General Information',
                icon: ClipboardCheck,
                fields: [
                    { id: 'client_name', label: 'Client Name', type: 'text' },
                    { id: 'report_no', label: 'Report No', type: 'text' },
                    { id: 'date', label: 'Date', type: 'date' },
                    { id: 'vendor_name', label: 'Vendor / Manufacturer', type: 'text' },
                    { id: 'location', label: 'Audit Location', type: 'text' },
                    { id: 'po_number', label: 'PO Number', type: 'text' }
                ]
            },
            {
                id: 'wpq_audit',
                title: 'Welding Procedure Qualifications',
                icon: ClipboardCheck,
                fields: [
                    { id: 'wpq_q1', label: 'WPSs reviewed for compliance?', type: 'select', options: ['Yes', 'No', 'N/A'] },
                    { id: 'wpq_q2', label: 'Welding parameters defined?', type: 'select', options: ['Yes', 'No', 'N/A'] },
                    { id: 'wpq_q3', label: 'Base/filler metal, preheat specified?', type: 'select', options: ['Yes', 'No', 'N/A'] },
                    { id: 'wpq_score', label: 'WPQ Score (0-10)', type: 'number' },
                    { id: 'wpq_observations', label: 'WPQ Observations', type: 'textarea' }
                ]
            },
            {
                id: 'pqr_audit',
                title: 'Procedure Qualification Records (PQR)',
                icon: ClipboardCheck,
                fields: [
                    { id: 'pqr_q1', label: 'PQRs reviewed against test results?', type: 'select', options: ['Yes', 'No', 'N/A'] },
                    { id: 'pqr_q2', label: 'Mechanical test results met criteria?', type: 'select', options: ['Yes', 'No', 'N/A'] },
                    { id: 'pqr_q3', label: 'Coupons, thickness, variables addressed?', type: 'select', options: ['Yes', 'No', 'N/A'] },
                    { id: 'pqr_score', label: 'PQR Score (0-10)', type: 'number' },
                    { id: 'pqr_observations', label: 'PQR Observations', type: 'textarea' }
                ]
            },
            {
                id: 'welder_audit',
                title: 'Welder Qualification & Continuity',
                icon: ClipboardCheck,
                fields: [
                    { id: 'welder_q1', label: 'Welders qualified per WPS?', type: 'select', options: ['Yes', 'No', 'N/A'] },
                    { id: 'welder_q2', label: 'WQRs available?', type: 'select', options: ['Yes', 'No', 'N/A'] },
                    { id: 'welder_q3', label: 'Continuity records maintained?', type: 'select', options: ['Yes', 'No', 'N/A'] },
                    { id: 'welder_q4', label: 'Skill matrix available?', type: 'select', options: ['Yes', 'No', 'N/A'] },
                    { id: 'welder_q5', label: 'Weld repair matrix maintained?', type: 'select', options: ['Yes', 'No', 'N/A'] },
                    { id: 'welder_score', label: 'Welder Score (0-10)', type: 'number' },
                    { id: 'welder_observations', label: 'Welder Observations', type: 'textarea' }
                ]
            },
            {
                id: 'consumables_audit',
                title: 'Welding Consumables Control',
                icon: ClipboardCheck,
                fields: [
                    { id: 'cons_q1', label: 'Storage per manufacturer recommendations?', type: 'select', options: ['Yes', 'No', 'N/A'] },
                    { id: 'cons_q2', label: 'Baking/holding procedures available?', type: 'select', options: ['Yes', 'No', 'N/A'] },
                    { id: 'cons_q3', label: 'Baking/holding records available?', type: 'select', options: ['Yes', 'No', 'N/A'] },
                    { id: 'cons_q4', label: 'Consumables traceable to heat/batch?', type: 'select', options: ['Yes', 'No', 'N/A'] },
                    { id: 'cons_score', label: 'Consumables Score (0-10)', type: 'number' },
                    { id: 'cons_observations', label: 'Consumables Observations', type: 'textarea' }
                ]
            },
            {
                id: 'joint_prep_audit',
                title: 'Joint Preparation & Fit-Up',
                icon: ClipboardCheck,
                fields: [
                    { id: 'joint_q1', label: 'Joint geometry complied with WPS?', type: 'select', options: ['Yes', 'No', 'N/A'] },
                    { id: 'joint_q2', label: 'Alignment, gap, bevel within tolerance?', type: 'select', options: ['Yes', 'No', 'N/A'] },
                    { id: 'joint_q3', label: 'Cleanliness before welding satisfactory?', type: 'select', options: ['Yes', 'No', 'N/A'] },
                    { id: 'joint_q4', label: 'Fit-up inspection done before welding?', type: 'select', options: ['Yes', 'No', 'N/A'] },
                    { id: 'joint_score', label: 'Joint Prep Score (0-10)', type: 'number' },
                    { id: 'joint_observations', label: 'Joint Prep Observations', type: 'textarea' }
                ]
            },
            {
                id: 'supervision_audit',
                title: 'Welding Supervision',
                icon: ClipboardCheck,
                fields: [
                    { id: 'sup_q1', label: 'Welding per approved WPS?', type: 'select', options: ['Yes', 'No', 'N/A'] },
                    { id: 'sup_q2', label: 'Protection (wind/moisture) satisfactory?', type: 'select', options: ['Yes', 'No', 'N/A'] },
                    { id: 'sup_q3', label: 'Fit-up inspection before welding?', type: 'select', options: ['Yes', 'No', 'N/A'] },
                    { id: 'sup_q4', label: 'Welders within valuable range?', type: 'select', options: ['Yes', 'No', 'N/A'] },
                    { id: 'sup_q5', label: 'Welding machines calibrated?', type: 'select', options: ['Yes', 'No', 'N/A'] },
                    { id: 'sup_score', label: 'Supervision Score (0-10)', type: 'number' },
                    { id: 'sup_observations', label: 'Supervision Observations', type: 'textarea' }
                ]
            },
            {
                id: 'ndt_audit',
                title: 'Inspection & Testing (NDT)',
                icon: ClipboardCheck,
                fields: [
                    { id: 'ndt_q1', label: 'QC Engineers are certified?', type: 'select', options: ['Yes', 'No', 'N/A'] },
                    { id: 'ndt_q2', label: 'NDT personnel certified?', type: 'select', options: ['Yes', 'No', 'N/A'] },
                    { id: 'ndt_q3', label: 'Inspection procedures approved?', type: 'select', options: ['Yes', 'No', 'N/A'] },
                    { id: 'ndt_score', label: 'NDT Score (0-10)', type: 'number' },
                    { id: 'ndt_observations', label: 'NDT Observations', type: 'textarea' }
                ]
            },
            {
                id: 'records_audit',
                title: 'Record & Documentation',
                icon: ClipboardCheck,
                fields: [
                    { id: 'rec_q1', label: 'Applicable WPS-PQR available?', type: 'select', options: ['Yes', 'No', 'N/A'] },
                    { id: 'rec_q2', label: 'Welders are qualified?', type: 'select', options: ['Yes', 'No', 'N/A'] },
                    { id: 'rec_q3', label: 'Welders continuity record maintained?', type: 'select', options: ['Yes', 'No', 'N/A'] },
                    { id: 'rec_q4', label: 'Welders skill matrix available?', type: 'select', options: ['Yes', 'No', 'N/A'] },
                    { id: 'rec_q5', label: 'Weld repair analysis available?', type: 'select', options: ['Yes', 'No', 'N/A'] },
                    { id: 'rec_q6', label: 'Consumables backing records available?', type: 'select', options: ['Yes', 'No', 'N/A'] },
                    { id: 'rec_q7', label: 'Consumables storage procedure available?', type: 'select', options: ['Yes', 'No', 'N/A'] },
                    { id: 'rec_q8', label: 'Welding machines/ovens calibrated?', type: 'select', options: ['Yes', 'No', 'N/A'] },
                    { id: 'rec_score', label: 'Records Score (0-10)', type: 'number' },
                    { id: 'rec_observations', label: 'Records Observations', type: 'textarea' }
                ]
            },
            {
                id: 'conclusion_audit',
                title: 'Audit Conclusion',
                icon: ClipboardCheck,
                fields: [
                    { id: 'overall_score', label: 'Overall Score (0-100)', type: 'number' },
                    { id: 'compliance_status', label: 'Compliance Status', type: 'select', options: ['Fully compliant', 'Generally compliant with minor non-conformances', 'Non-compliant with major deficiencies'] },
                    { id: 'auditor_remarks', label: 'Overall Auditor Remarks', type: 'textarea' }
                ]
            },
            {
                id: 'signatures',
                title: 'Signatures & Photos',
                icon: ClipboardCheck,
                fields: [
                    { id: 'audited_by_name', label: 'Audited By (Name)', type: 'text' },
                    { id: 'reviewed_by_name', label: 'Reviewed By (Name)', type: 'text' },
                    { id: 'photos', label: 'Audit Photos', type: 'image_upload' }
                ]
            }
        ]
    }
};

