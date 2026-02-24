const LiquidPenetrantInspection = require('../../models/ndt/LiquidPenetrantInspection');

// Create Report
exports.createReport = async (req, res) => {
    try {
        let reportData = { ...req.body, created_by: req.user._id };

        // Ensure report_no is handled correctly
        if (reportData.report_no === '' || !reportData.report_no) {
            delete reportData.report_no;
        }

        // Clean empty fields that might cause validation issues
        Object.keys(reportData).forEach(key => {
            const value = reportData[key];
            if (value === '' || value === null || value === undefined || (typeof value === 'number' && isNaN(value))) {
                if (!['client_name', 'formType', 'status', 'created_by'].includes(key)) {
                    delete reportData[key];
                }
            }
            else if (Array.isArray(value) && value.length === 0 && key !== 'results') {
                delete reportData[key];
            }
        });

        const report = new LiquidPenetrantInspection(reportData);
        await report.save();
        res.status(201).json(report);
    } catch (error) {
        console.error('CREATE LPT REPORT ERROR:', error);
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(v => v.message);
            return res.status(400).json({ message: `Validation Error: ${messages.join(', ')}` });
        }
        res.status(500).json({ message: error.message });
    }
};

// Get All Reports
exports.getAllReports = async (req, res) => {
    try {
        let query = {};
        if (req.user.role !== 'master_admin' && req.user.role !== 'super_admin') {
            query.created_by = req.user._id;
        }

        // Support filtering by common fields
        if (req.query.report_no) query.report_no = req.query.report_no;
        if (req.query.client_name) query.client_name = req.query.client_name;

        const reports = await LiquidPenetrantInspection.find(query).sort({ createdAt: -1 });
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
        const report = await LiquidPenetrantInspection.findOne(query);
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

        // Allow report_no to be updated if provided; remove only _id and created_by
        const { _id, created_by, ...safeBody } = req.body;

        // if client cleared report_no, drop it so we keep existing number
        if (safeBody.report_no === '') {
            delete safeBody.report_no;
        }

        const report = await LiquidPenetrantInspection.findOneAndUpdate(
            query,
            { $set: safeBody },
            { new: true }  // no runValidators — avoids false unique-constraint hits
        );

        if (!report) return res.status(404).json({ message: 'Report not found' });
        res.status(200).json(report);
    } catch (error) {
        console.error('UPDATE LPT REPORT ERROR:', error);
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(v => v.message);
            return res.status(400).json({ message: `Validation Error: ${messages.join(', ')}` });
        }
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
        const report = await LiquidPenetrantInspection.findOneAndDelete(query);
        if (!report) return res.status(404).json({ message: 'Report not found' });
        res.status(200).json({ message: 'Report deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get Next Report No (Helper for UI)
exports.getNextReportNo = async (req, res) => {
    try {
        const lastReport = await LiquidPenetrantInspection.findOne({}, {}, { sort: { 'createdAt': -1 } });
        const year = new Date().getFullYear();
        let nextNum = 1;

        if (lastReport && lastReport.report_no) {
            const parts = lastReport.report_no.split('-');
            if (parts.length === 3 && parts[1] === year.toString()) {
                nextNum = parseInt(parts[2], 10) + 1;
            }
        }

        const nextReportNo = `LPT-${year}-${nextNum.toString().padStart(4, '0')}`;
        res.status(200).json({ nextReportNo });
    } catch (error) {
        console.error('GET NEXT REPORT NO ERROR:', error);
        res.status(500).json({ message: error.message });
    }
};

