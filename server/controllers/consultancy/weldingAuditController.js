const WeldingAssessmentAudit = require('../../models/consultancy/WeldingAssessmentAudit');

// Create Report
exports.createReport = async (req, res) => {
    try {
        let reportData = {
            ...req.body,
            created_by: req.user._id
        };

        // ALWAYS remove report_no to trigger auto-generation
        delete reportData.report_no;

        // Remove invalid ObjectId fields (empty string / 'undefined' / non-24-char hex)
        const isValidObjectId = (v) => /^[0-9a-fA-F]{24}$/.test(v);
        if (reportData.serviceId !== undefined && !isValidObjectId(reportData.serviceId)) {
            delete reportData.serviceId;
        }

        // Remove empty/invalid non-required fields
        const fieldsToClean = ['vendor_name', 'location', 'po_number', 'auditor_remarks', 'audited_by_name', 'reviewed_by_name', 'audited_by_sign', 'reviewed_by_sign', 'photos'];
        fieldsToClean.forEach(field => {
            if (reportData[field] === '' || (Array.isArray(reportData[field]) && reportData[field].length === 0)) {
                delete reportData[field];
            }
        });

        // Also remove empty number/null fields that might cause validation issues
        Object.keys(reportData).forEach(key => {
            const value = reportData[key];
            // Remove empty strings, null, undefined, NaN
            if (value === '' || value === null || value === undefined || (typeof value === 'number' && isNaN(value))) {
                // But keep client_name and formType
                if (!['client_name', 'formType', 'status', 'created_by'].includes(key)) {
                    delete reportData[key];
                }
            }
        });

        console.log('Creating Welding Audit with fields:', Object.keys(reportData));
        const report = new WeldingAssessmentAudit(reportData);
        await report.save();
        res.status(201).json(report);
    } catch (error) {
        console.error('CREATE WELDING AUDIT REPORT ERROR:', error.message);
        if (error.name === 'ValidationError' || error.name === 'CastError') {
            const messages = error.name === 'ValidationError'
                ? Object.values(error.errors).map(val => `[${val.path}]: ${val.message}`)
                : [`[${error.path}]: Invalid value '${error.value}' for type ${error.kind}`];
            console.error('Validation fields:', messages);
            return res.status(400).json({ message: `Validation Error: ${messages.join(', ')}` });
        }
        res.status(500).json({ message: error.message });
    }
};

// Get All Reports
exports.getAllReports = async (req, res) => {
    try {
        let query = { ...req.query };
        // Role-based filtering
        if (req.user.role !== 'master_admin' && req.user.role !== 'super_admin') {
            query.created_by = req.user._id;
        }

        const reports = await WeldingAssessmentAudit.find(query).sort({ createdAt: -1 });
        res.status(200).json(reports);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get Report by ID
exports.getReportById = async (req, res) => {
    try {
        const query = { _id: req.params.id };
        if (req.user.role !== 'master_admin' && req.user.role !== 'super_admin') {
            query.created_by = req.user._id;
        }

        const report = await WeldingAssessmentAudit.findOne(query);
        if (!report) return res.status(404).json({ message: 'Report not found' });
        res.status(200).json(report);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update Report
exports.updateReport = async (req, res) => {
    try {
        const query = { _id: req.params.id };
        if (req.user.role !== 'master_admin' && req.user.role !== 'super_admin') {
            query.created_by = req.user._id;
        }

        const report = await WeldingAssessmentAudit.findOneAndUpdate(query, req.body, { new: true });
        if (!report) return res.status(404).json({ message: 'Report not found' });
        res.status(200).json(report);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete Report
exports.deleteReport = async (req, res) => {
    try {
        const query = { _id: req.params.id };
        if (req.user.role !== 'master_admin' && req.user.role !== 'super_admin') {
            query.created_by = req.user._id;
        }

        const report = await WeldingAssessmentAudit.findOneAndDelete(query);
        if (!report) return res.status(404).json({ message: 'Report not found' });
        res.status(200).json({ message: 'Report deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
