const LiftInspection = require('../models/LiftInspection');

exports.createInspection = async (req, res) => {
    try {
        const inspectionData = {
            ...req.body,
            created_by: req.user._id
        };

        // Handle potentially invalid serviceId from frontend slugs
        if (inspectionData.serviceId === '' || inspectionData.serviceId === 'null' || inspectionData.serviceId === null) {
            delete inspectionData.serviceId;
        }

        const inspection = new LiftInspection(inspectionData);
        await inspection.save();
        console.log('SUCCESSFULLY CREATED INSPECTION:', inspection.report_no);
        res.status(201).json(inspection);
    } catch (error) {
        console.error('CREATE INSPECTION ERROR:', error);
        console.error('REQUEST BODY:', JSON.stringify(req.body, null, 2));

        // Handle Mongoose Validation Errors
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ message: `Validation Error: ${messages.join(', ')}`, errors: error.errors });
        }

        // Handle Mongoose Cast Errors (e.g. invalid IDs)
        if (error.name === 'CastError') {
            return res.status(400).json({ message: `Invalid Data Format: ${error.path} value "${error.value}" is incorrect.` });
        }

        res.status(500).json({ message: error.message, stack: error.stack });
    }
};

exports.getAllInspections = async (req, res) => {
    try {
        const { serviceId, client_name } = req.query;
        let query = {};

        // If serviceId is provided, filter by it
        if (serviceId) {
            query.serviceId = serviceId;
        }

        // If client_name is provided, filter by it
        if (client_name) {
            query.client_name = client_name;
        }

        // Role-based filtering
        if (req.user.role !== 'master_admin' && req.user.role !== 'super_admin') {
            // Standard users (inspectors, coordinators) only see their own
            query.created_by = req.user._id;
        }
        // If it's a dashboard view without a serviceId, and they aren't admin, 
        // they still only see their own. Admins see all in this controller now.

        const inspections = await LiftInspection.find(query)
            .populate('created_by', 'email role')
            .sort({ createdAt: -1 });

        // Get profiles for names
        const Profile = require('../models/Profile');
        const inspectionsWithProfiles = await Promise.all(inspections.map(async (insp) => {
            const inspObj = insp.toObject();
            if (insp.created_by) {
                const profile = await Profile.findOne({ user: insp.created_by._id });
                inspObj.inspector_name = profile?.full_name || insp.created_by.email;
            }
            return inspObj;
        }));

        res.json(inspectionsWithProfiles);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getInspectionById = async (req, res) => {
    try {
        const inspection = await LiftInspection.findOne({
            _id: req.params.id,
            created_by: req.user._id
        });
        if (!inspection) {
            return res.status(404).json({ message: 'Inspection not found' });
        }
        res.json(inspection);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateInspection = async (req, res) => {
    try {
        const inspection = await LiftInspection.findOneAndUpdate(
            { _id: req.params.id, created_by: req.user._id },
            req.body,
            { new: true }
        );
        if (!inspection) {
            return res.status(404).json({ message: 'Inspection not found' });
        }
        res.json(inspection);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteInspection = async (req, res) => {
    try {
        const inspection = await LiftInspection.findOneAndDelete({
            _id: req.params.id,
            created_by: req.user._id
        });
        if (!inspection) {
            return res.status(404).json({ message: 'Inspection not found' });
        }
        res.json({ message: 'Inspection deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.verifyInspection = async (req, res) => {
    try {
        const inspection = await LiftInspection.findOne({
            qr_code_token: req.params.token
        });
        if (!inspection) {
            return res.status(404).json({ message: 'Inspection not found' });
        }
        res.json(inspection);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
