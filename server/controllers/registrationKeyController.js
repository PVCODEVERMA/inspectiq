const RegistrationKey = require('../models/RegistrationKey');
const User = require('../models/User');

// Utility to generate a unique 10-digit key
const generateUniqueKey = async () => {
    let key;
    let exists = true;

    while (exists) {
        key = Math.floor(1000000000 + Math.random() * 9000000000).toString();
        const existing = await RegistrationKey.findOne({ key });
        exists = !!existing;
    }

    return key;
};

// Generate new registration key (Master Admin only)
exports.generateKey = async (req, res) => {
    try {
        console.log('Generate key request received');
        console.log('User:', req.user);
        console.log('Request body:', req.body);

        const { role, phoneNumber } = req.body;

        if (!role) {
            console.log('Error: Role is required');
            return res.status(400).json({ message: 'Role is required' });
        }

        if (!phoneNumber) {
            console.log('Error: Phone number is required');
            return res.status(400).json({ message: 'Phone number is required' });
        }

        const key = await generateUniqueKey();
        console.log('Generated unique key:', key);

        const registrationKey = new RegistrationKey({
            key,
            role,
            phoneNumber,
            createdBy: req.user.id
        });

        await registrationKey.save();
        console.log('Registration key saved successfully');

        res.status(201).json({
            message: 'Registration key generated successfully',
            key: registrationKey.key,
            role: registrationKey.role,
            createdAt: registrationKey.createdAt
        });
    } catch (error) {
        console.error('Error in generateKey:', error);
        res.status(500).json({ message: error.message });
    }
};

// Get all registration keys (Master Admin only)
exports.getAllKeys = async (req, res) => {
    try {
        const keys = await RegistrationKey.find()
            .populate('createdBy', 'email')
            .populate('usedBy', 'email')
            .sort({ createdAt: -1 });

        res.json(keys);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Validate a registration key
exports.validateKey = async (req, res) => {
    try {
        const { key } = req.params;

        const registrationKey = await RegistrationKey.findOne({ key });

        if (!registrationKey) {
            return res.status(404).json({
                valid: false,
                message: 'Invalid registration key'
            });
        }

        if (registrationKey.isUsed) {
            return res.status(400).json({
                valid: false,
                message: 'This registration key has already been used'
            });
        }

        res.json({
            valid: true,
            role: registrationKey.role,
            message: 'Valid registration key'
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
