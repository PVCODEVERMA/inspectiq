const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

async function run() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('DB Connected');
        const roles = await User.aggregate([
            { $group: { _id: '$role', count: { $sum: 1 } } }
        ]);
        console.log('Role Distribution:', JSON.stringify(roles, null, 2));

        const total = await User.countDocuments();
        console.log('Total Users:', total);

        const sample = await User.findOne({});
        if (sample) {
            console.log('Sample User Role:', sample.role);
            console.log('Sample User Keys:', Object.keys(sample._doc));
        }

        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}
run();
