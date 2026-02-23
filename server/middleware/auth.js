const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async (req, res, next) => {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');

    // Check if no token
    if (!token) {
        console.log('[Auth] Error: No token provided');
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    if (typeof next !== 'function') {
        console.error('[Auth] Critical: next is not a function');
        return res.status(500).json({ message: 'Internal Server Error: Auth mechanism failure' });
    }

    // Verify token
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (!decoded || !decoded.id) {
            console.error('[Auth] Error: Invalid token payload format');
            return res.status(401).json({ message: 'Token is not valid' });
        }

        const user = await User.findById(decoded.id).select('-privateKey');
        if (!user) {
            console.warn(`[Auth] Warning: User not found in DB for ID: ${decoded.id}`);
            return res.status(401).json({ message: 'User not found, token invalid' });
        }

        if (!user.isActive) {
            console.log(`[Auth] Info: Access denied for inactive user: ${user.email}`);
            return res.status(403).json({ message: 'Account is inactive' });
        }

        // Attach user to request
        req.user = user;

        // Safety call
        return next();
    } catch (err) {
        console.error('[Auth] Verification Error:', err.message);
        return res.status(401).json({ message: 'Token is not valid or expired' });
    }
};
