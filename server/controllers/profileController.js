const Profile = require('../models/Profile');

exports.getProfile = async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id });
        if (!profile) {
            return res.status(404).json({ message: 'Profile not found' });
        }
        res.json(profile);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateAvatar = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const profile = await Profile.findOneAndUpdate(
            { user: req.user.id },
            { avatar_url: `/uploads/${req.file.filename}` },
            { new: true, upsert: true }
        );

        res.json({
            message: 'Avatar updated successfully',
            avatar_url: profile.avatar_url
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
