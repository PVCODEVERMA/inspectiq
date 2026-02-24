const NDTSummaryInspection = require('../../models/ndt/NDTSummaryInspection');

exports.createReport = async (req, res) => {
    try {
        let reportData = { ...req.body, created_by: req.user._id };

        // ALWAYS remove report_no to trigger auto-generation
        delete reportData.report_no;

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

        const report = new NDTSummaryInspection(reportData);
        await report.save();
        res.status(201).json(report);
    } catch (error) {
        console.error('CREATE NDT SUMMARY REPORT ERROR:', error.message);
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ message: `Validation Error: ${messages.join(', ')}` });
        }

        res.status(500).json({ message: error.message });
    }
};

exports.getAllReports = async (req, res) => {
    try {
        let query = { ...req.query };
        if (req.user.role !== 'master_admin' && req.user.role !== 'super_admin') {
            query.created_by = req.user._id;
        }
        const reports = await NDTSummaryInspection.find(query).sort({ createdAt: -1 });
        res.status(200).json(reports);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getReportById = async (req, res) => {
    try {
        const query = { _id: req.params.id };
        if (req.user.role !== 'master_admin' && req.user.role !== 'super_admin') {
            query.created_by = req.user._id;
        }
        const report = await NDTSummaryInspection.findOne(query);
        if (!report) return res.status(404).json({ message: 'Report not found' });
        res.status(200).json(report);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateReport = async (req, res) => {
    try {
        const query = { _id: req.params.id };
        if (req.user.role !== 'master_admin' && req.user.role !== 'super_admin') {
            query.created_by = req.user._id;
        }
        const report = await NDTSummaryInspection.findOneAndUpdate(query, req.body, { new: true });
        if (!report) return res.status(404).json({ message: 'Report not found' });
        res.status(200).json(report);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteReport = async (req, res) => {
    try {
        const query = { _id: req.params.id };
        if (req.user.role !== 'master_admin' && req.user.role !== 'super_admin') {
            query.created_by = req.user._id;
        }
        const report = await NDTSummaryInspection.findOneAndDelete(query);
        if (!report) return res.status(404).json({ message: 'Report not found' });
        res.status(200).json({ message: 'Report deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
