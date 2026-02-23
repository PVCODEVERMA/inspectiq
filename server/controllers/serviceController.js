const Service = require('../models/Service');
const LiftInspection = require('../models/LiftInspection');

// Get all services with statistics (Master Admin only)
exports.getAllServices = async (req, res) => {
    try {
        const services = await Service.find()
            .populate('createdBy', 'email role')
            .populate('updatedBy', 'email role')
            .sort({ name: 1 })
            .lean();

        // Get profiles for names (since name is in Profile model)
        const Profile = require('../models/Profile');

        for (let service of services) {
            // Get stats from inspections
            const stats = await LiftInspection.aggregate([
                { $match: { serviceId: service._id } },
                {
                    $group: {
                        _id: null,
                        total: { $sum: 1 },
                        approved: { $sum: { $cond: [{ $eq: ["$status", "approved"] }, 1, 0] } },
                        pending: { $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] } },
                        rejected: { $sum: { $cond: [{ $eq: ["$status", "rejected"] }, 1, 0] } }
                    }
                }
            ]);

            service.stats = stats[0] || { total: 0, approved: 0, pending: 0, rejected: 0 };

            // Add names from profiles
            if (service.createdBy) {
                const creatorProfile = await Profile.findOne({ user: service.createdBy._id });
                service.createdBy.full_name = creatorProfile?.full_name || service.createdBy.email;
            }
            if (service.updatedBy) {
                const updaterProfile = await Profile.findOne({ user: service.updatedBy._id });
                service.updatedBy.full_name = updaterProfile?.full_name || service.updatedBy.email;
            }
        }

        res.json(services);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get active services
exports.getActiveServices = async (req, res) => {
    try {
        const services = await Service.find({ isActive: true }).sort({ name: 1 });
        res.json(services);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create new service (Master Admin only)
exports.createService = async (req, res) => {
    try {
        const { name, description } = req.body;

        const existing = await Service.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
        if (existing) {
            return res.status(400).json({ message: 'Service with this name already exists' });
        }

        const service = new Service({
            name,
            description,
            createdBy: req.user.id
        });

        await service.save();
        res.status(201).json(service);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update service (Master Admin only)
exports.updateService = async (req, res) => {
    try {
        const { name, description, isActive } = req.body;
        const service = await Service.findById(req.params.id);

        if (!service) {
            return res.status(404).json({ message: 'Service not found' });
        }

        if (name) service.name = name;
        if (description !== undefined) service.description = description;
        if (isActive !== undefined) service.isActive = isActive;

        // Track who updated it
        service.updatedBy = req.user.id;

        await service.save();
        res.json(service);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete/Deactivate service
exports.deleteService = async (req, res) => {
    try {
        const service = await Service.findById(req.params.id);
        if (!service) {
            return res.status(404).json({ message: 'Service not found' });
        }

        // We'll perform a soft delete by deactivating
        service.isActive = false;
        await service.save();

        res.json({ message: 'Service deactivated successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// Get specific service details with statistics (Admin only)
exports.getServiceDetails = async (req, res) => {
    try {
        const mongoose = require('mongoose');
        const Profile = require('../models/Profile');
        const { id } = req.params;

        console.log(`[ServiceController] Fetching details for ID: ${id}`);

        if (!mongoose.Types.ObjectId.isValid(id)) {
            console.error(`[ServiceController] Invalid ObjectID format: ${id}`);
            return res.status(400).json({ message: 'Invalid Service ID format' });
        }

        const service = await Service.findById(id)
            .populate('createdBy', 'email role')
            .populate('updatedBy', 'email role')
            .lean();

        if (!service) {
            console.error(`[ServiceController] Service NOT found in DB: ${id}`);
            return res.status(404).json({ message: 'Service not found' });
        }

        // Get stats - explicitly use ObjectId for aggregate match
        const stats = await LiftInspection.aggregate([
            { $match: { serviceId: new mongoose.Types.ObjectId(id) } },
            {
                $group: {
                    _id: null,
                    total: { $sum: 1 },
                    approved: { $sum: { $cond: [{ $eq: ["$status", "approved"] }, 1, 0] } },
                    pending: { $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] } },
                    rejected: { $sum: { $cond: [{ $eq: ["$status", "rejected"] }, 1, 0] } }
                }
            }
        ]);

        service.stats = stats[0] || { total: 0, approved: 0, pending: 0, rejected: 0 };

        // Add names
        if (service.createdBy) {
            const creatorProfile = await Profile.findOne({ user: service.createdBy._id });
            service.createdBy.full_name = creatorProfile?.full_name || service.createdBy.email;
        }
        if (service.updatedBy) {
            const updaterProfile = await Profile.findOne({ user: service.updatedBy._id });
            service.updatedBy.full_name = updaterProfile?.full_name || service.updatedBy.email;
        }

        console.log(`[ServiceController] Successfully loaded detail for: ${service.name}`);
        res.json(service);
    } catch (error) {
        console.error('[ServiceController] Error in getServiceDetails:', error);
        res.status(500).json({ message: error.message });
    }
};
