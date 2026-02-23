const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const Profile = require('../models/Profile');

// Get all staff users (for assignment dropdowns)
router.get('/staff', auth, async (req, res) => {
    try {
        const users = await User.find({
            role: {
                $in: ['service_manager', 'inspection_coordinator', 'technical_coordinator', 'inspector', 'master_admin']
            },
            isActive: true
        }).select('email role _id');

        const usersWithProfile = await Promise.all(users.map(async (user) => {
            const profile = await Profile.findOne({ user: user._id }).select('full_name');
            return {
                _id: user._id,
                email: user.email,
                role: user.role,
                full_name: profile ? profile.full_name : ''
            };
        }));

        res.json(usersWithProfile);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
