const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

async function repair() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('DB Connected');

        // 1. Fix Master Admin missing password
        const masterAdmin = await User.findOne({ email: process.env.MASTER_ADMIN_EMAIL, role: 'master_admin' });
        if (masterAdmin && !masterAdmin.password) {
            console.log('Repairing Master Admin password...');
            masterAdmin.password = process.env.MASTER_ADMIN_PASSWORD;
            await masterAdmin.save();
            console.log('Master Admin password repaired.');
        } else {
            console.log('Master Admin already has a password or not found.');
        }

        // 2. Fix other users missing passwords (fallback to privateKey)
        const usersWithoutPassword = await User.find({ password: { $exists: false } });
        console.log(`Found ${usersWithoutPassword.length} users without password.`);

        for (const user of usersWithoutPassword) {
            console.log(`Repairing password for user: ${user.email}`);
            user.password = user.privateKey || 'TemporaryPass123!';
            await user.save();
        }

        // 3. Remove sub_admin if any remain (optional, but good for cleanup)
        const subAdminDelete = await User.deleteMany({ role: 'sub_admin' });
        console.log(`Deleted ${subAdminDelete.deletedCount} sub_admin records.`);

        console.log('Database repair completed.');
        process.exit(0);
    } catch (err) {
        console.error('Repair Error:', err);
        process.exit(1);
    }
}

repair();
