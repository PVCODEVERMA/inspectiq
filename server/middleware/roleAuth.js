/**
 * Middleware to restrict access based on user roles.
 */

const isAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized: User not found' });
    }

    if (req.user.role !== 'master_admin' && req.user.role !== 'super_admin') {
        return res.status(403).json({ message: 'Access denied: Admin only' });
    }

    if (typeof next !== 'function') {
        console.error('[roleAuth] Critical: next is not a function in isAdmin');
        return res.status(500).json({ message: 'Internal Server Error: Middleware chain broken' });
    }

    next();
};

const masterAdminOnly = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized: User not found' });
    }

    if (req.user.role !== 'master_admin') {
        return res.status(403).json({ message: 'Access denied: Master Admin only' });
    }

    if (typeof next !== 'function') {
        console.error('[roleAuth] Critical: next is not a function in masterAdminOnly');
        return res.status(500).json({ message: 'Internal Server Error: Middleware chain broken' });
    }

    next();
};

module.exports = {
    isAdmin,
    masterAdminOnly
};
