const LiquidPenetrantInspection = require('../../models/ndt/LiquidPenetrantInspection');

// Create Report — with retry on duplicate report_no collision
exports.createReport = async (req, res) => {
    const saveWithRetry = async (reportData, attempt = 0) => {
        const doc = new LiquidPenetrantInspection({ ...reportData });
        if (attempt > 0) delete doc.report_no; // force pre-save to pick fresh number
        try {
            await doc.save();
            return doc;
        } catch (err) {
            if (err.code === 11000 && attempt < 3) {
                // Race condition: another request grabbed the same auto-number, retry
                return saveWithRetry(reportData, attempt + 1);
            }
            throw err;
        }
    };

    try {
        let reportData = { ...req.body, created_by: req.user._id };

        // Standardize field names
        reportData.client_name = reportData.client_name || reportData.client;
        reportData.report_no = reportData.report_no || reportData.reportNo;

        // Let pre-save hook auto-generate if blank/auto
        if (!reportData.report_no || ['Auto', 'Auto / Manual', ''].includes(reportData.report_no)) {
            delete reportData.report_no;
        }

        const report = await saveWithRetry(reportData);
        res.status(201).json(report);
    } catch (error) {
        console.error('CREATE LPT REPORT ERROR:', error);
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(v => v.message);
            return res.status(400).json({ message: `Validation Error: ${messages.join(', ')}` });
        }
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Report Number already exists. Please try again.' });
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

        // Strip immutable fields — never allow report_no/_id to be changed
        const { report_no, _id, created_by, ...safeBody } = req.body;

        const report = await LiquidPenetrantInspection.findOneAndUpdate(
            query,
            { $set: safeBody },
            { new: true }  // no runValidators — avoids false unique-constraint hits
        );

        if (!report) return res.status(404).json({ message: 'Report not found' });
        res.status(200).json(report);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Report Number already exists.' });
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

        const nextReportNo = `PT-${year}-${nextNum.toString().padStart(4, '0')}`;
        res.status(200).json({ nextReportNo });
    } catch (error) {
        console.error('GET NEXT REPORT NO ERROR:', error);
        res.status(500).json({ message: error.message });
    }
};

