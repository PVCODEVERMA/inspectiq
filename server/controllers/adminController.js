const User = require('../models/User');
const Profile = require('../models/Profile');

exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-privateKey').populate('assignedServices', 'name');
        const usersWithProfile = await Promise.all(users.map(async (user) => {
            const profile = await Profile.findOne({ user: user._id });
            return {
                ...user._doc,
                profile
            };
        }));
        res.json(usersWithProfile);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


exports.getAdminStats = async (req, res) => {
    try {
        const counts = await Promise.all([
            User.countDocuments(),
            User.countDocuments({ isActive: true }),
            User.countDocuments({ role: 'service_manager' }),
            User.countDocuments({ role: 'technical_coordinator' }),
            User.countDocuments({ role: 'inspector' }),
            User.countDocuments({ role: 'inspection_coordinator' })
        ]);

        const stats = {
            totalUsers: counts[0],
            activeUsers: counts[1],
            serviceManagers: counts[2],
            technicalCoordinators: counts[3],
            inspectors: counts[4],
            inspectionCoordinators: counts[5]
        };

        console.log('Sending stats:', stats);
        res.json(stats);
    } catch (error) {
        console.error('Stats Error:', error);
        res.status(500).json({ message: error.message });
    }
};


// Update user (Master Admin only)
exports.updateUser = async (req, res) => {
    try {
        const { full_name, email, phoneNumber, role, password, assignedServices } = req.body;
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Don't allow editing Master Admin via this route for security
        if (user.role === 'master_admin') {
            return res.status(403).json({ message: 'Cannot edit Master Admin via this route' });
        }

        // Update basic info
        if (email) user.email = email;
        if (phoneNumber) user.phoneNumber = phoneNumber;
        if (role) user.role = role;
        if (assignedServices) user.assignedServices = assignedServices;
        if (password && password.trim() !== '') {
            user.password = password;
        }

        await user.save();

        // Update profile name
        if (full_name) {
            await Profile.findOneAndUpdate(
                { user: user._id },
                { full_name },
                { upsert: true }
            );
        }

        res.json({ message: 'User updated successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getUserById = async (req, res) => {
    try {
        console.log(`[AdminAPI] Fetching member profile for ID: ${req.params.id}`);
        const user = await User.findById(req.params.id).select('-privateKey').populate('assignedServices', 'name');

        if (!user) {
            console.warn(`[AdminAPI] Member not found: ${req.params.id}`);
            return res.status(404).json({ message: 'User not found' });
        }

        const profile = await Profile.findOne({ user: user._id });
        const userData = user.toObject();

        console.log(`[AdminAPI] Profile found for: ${user.email}`);
        res.json({
            ...userData,
            profile
        });
    } catch (error) {
        console.error(`[AdminAPI] Error fetching member ${req.params.id}:`, error.message);
        res.status(500).json({ message: error.message });
    }
};


