const CompanyProfile = require('../models/CompanyProfile');

// Get Company Profile
exports.getCompanyProfile = async (req, res) => {
    try {
        const profile = await CompanyProfile.findOne();
        if (!profile) {
            // Return empty profile object instead of error to allow initial setup
            return res.json({
                companyName: '',
                address: '',
                phone: '',
                email: '',
                website: '',
                logoUrl: '',
                gstin: '',
                pan: '',
                bankDetails: {
                    bankName: '',
                    accountNo: '',
                    ifscCode: '',
                    branch: ''
                },
                reportBranding: {
                    headerColor: '#F44034',
                    footerText: ''
                }
            });
        }
        res.json(profile);
    } catch (error) {
        console.error('Error fetching company profile:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Update or Create Company Profile
exports.updateCompanyProfile = async (req, res) => {
    try {
        let profile = await CompanyProfile.findOne();

        if (profile) {
            // Update existing
            profile = await CompanyProfile.findByIdAndUpdate(
                profile._id,
                { ...req.body, updatedAt: Date.now() },
                { new: true, runValidators: true }
            );
        } else {
            // Create new
            profile = new CompanyProfile(req.body);
            await profile.save();
        }

        res.json({
            message: 'Company profile updated successfully',
            profile
        });
    } catch (error) {
        console.error('Error updating company profile:', error);
        res.status(500).json({ message: error.message || 'Error updating company profile' });
    }
};
