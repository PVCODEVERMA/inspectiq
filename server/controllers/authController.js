const User = require('../models/User');
const Profile = require('../models/Profile');
const jwt = require('jsonwebtoken');

// Generate a random 10-digit private key
const generatePrivateKey = () => {
    return Math.floor(1000000000 + Math.random() * 9000000000).toString();
};

// Master Admin Login
exports.masterAdminLogin = async (req, res) => {
    try {
        const { email, password, secretKey } = req.body;

        if (email !== process.env.MASTER_ADMIN_EMAIL) {
            return res.status(400).json({ message: 'Invalid Master Admin credentials' });
        }

        if (password !== process.env.MASTER_ADMIN_PASSWORD) {
            return res.status(400).json({ message: 'Invalid Master Admin credentials' });
        }

        if (secretKey !== process.env.MASTER_ADMIN_SECRET_KEY) {
            return res.status(400).json({ message: 'Invalid Master Admin credentials' });
        }

        const user = await User.findOne({ email, role: 'master_admin' });
        if (!user) {
            return res.status(400).json({ message: 'Master Admin not found. Please register first.' });
        }

        // Set user online and ensure password exists to pass validation
        user.isOnline = true;
        if (!user.password) {
            user.password = password; // Use the verified password from request
        }
        await user.save();

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.json({ token, user: { id: user._id, email, role: user.role } });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Regular User Login
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        if (!user.isActive) {
            return res.status(403).json({ message: 'Account is inactive. Contact administrator.' });
        }

        // Set user online
        user.isOnline = true;
        await user.save();

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.json({ token, user: { id: user._id, email, role: user.role } });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create User (Master Admin only)
exports.createUser = async (req, res) => {
    try {
        const { email, full_name, role, phoneNumber, password, assignedServices } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const privateKey = generatePrivateKey();

        // Ensure password is not an empty string
        const finalPassword = (password && password.trim() !== '') ? password : privateKey;

        const user = new User({
            email,
            password: finalPassword,
            privateKey,
            role,
            phoneNumber,
            isActive: true,
            assignedServices: assignedServices || []
        });
        await user.save();

        const profile = new Profile({
            user: user._id,
            full_name,
            phone: phoneNumber
        });
        console.log('Create User - Saving profile...');
        await profile.save();
        console.log('Create User - SUCCESS for:', email);

        res.status(201).json({
            message: 'User created successfully',
            user: { id: user._id, email, role: user.role },
            privateKey
        });
    } catch (error) {
        console.error('Create User - ERROR:', error.message);
        res.status(500).json({ message: error.message });
    }
};

// Get current user
exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
            .select('-password -privateKey')
            .populate('assignedServices', 'name');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const profile = await Profile.findOne({ user: user._id });

        res.json({
            user: {
                id: user._id,
                email: user.email,
                role: user.role,
                isActive: user.isActive,
                isOnline: user.isOnline,
                lastSeen: user.lastSeen,
                phoneNumber: user.phoneNumber,
                assignedServices: user.assignedServices
            },
            profile
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Check if Master Admin exists
exports.checkMasterAdminExists = async (req, res) => {
    try {
        const masterAdmin = await User.findOne({ role: 'master_admin' });
        res.json({ exists: !!masterAdmin });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Public registration removed as per requirement. All users must be created by Master Admin.

// Register Master Admin
exports.registerMasterAdmin = async (req, res) => {
    try {
        const { email, password, secretKey, full_name } = req.body;

        if (email !== process.env.MASTER_ADMIN_EMAIL) {
            return res.status(400).json({ message: 'Invalid Master Admin email' });
        }

        if (password !== process.env.MASTER_ADMIN_PASSWORD) {
            return res.status(400).json({ message: 'Invalid Master Admin password' });
        }

        if (secretKey !== process.env.MASTER_ADMIN_SECRET_KEY) {
            return res.status(400).json({ message: 'Invalid secret key' });
        }

        // Check if Master Admin already registered
        const existingUser = await User.findOne({ email, role: 'master_admin' });
        if (existingUser) {
            console.log('Master Admin already exists');
            return res.status(400).json({ message: 'Master Admin already registered. Please login.' });
        }

        // Create Master Admin user
        const user = new User({
            email,
            password: password || process.env.MASTER_ADMIN_PASSWORD,
            privateKey: 'MASTER_ADMIN_ENV_AUTH',
            role: 'master_admin',
            isActive: true
        });
        await user.save();
        console.log('User created:', user._id);

        // Create Master Admin profile
        const profile = new Profile({
            user: user._id,
            full_name: full_name || 'Master Admin',
            avatar_url: req.file ? `/uploads/${req.file.filename}` : undefined
        });
        await profile.save();
        console.log('Profile created:', profile._id);

        res.status(201).json({
            message: 'Master Admin registered successfully',
            user: { id: user._id, email, role: user.role }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: error.message });
    }
};

// Logout user
exports.logout = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (user) {
            user.isOnline = false;
            user.lastSeen = new Date();
            await user.save();
        }
        res.json({ message: 'Logged out successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
