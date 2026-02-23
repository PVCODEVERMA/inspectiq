const mongoose = require('mongoose');
require('dotenv').config();

const LiftInspection = require('./models/LiftInspection');

async function check() {
    try {
        console.log('Connecting to:', process.env.MONGODB_URI.substring(0, 30) + '...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('DB Connected');

        const collection = mongoose.model('LiftInspection').collection;
        console.log('Using collection:', collection.name);

        const indexes = await collection.indexes();
        console.log('Indexes:', JSON.stringify(indexes, null, 2));

        for (const idx of indexes) {
            if (idx.unique && idx.name !== '_id_') {
                console.log(`Found unique index: ${idx.name} on ${JSON.stringify(idx.key)}. Dropping...`);
                await collection.dropIndex(idx.name);
                console.log(`Dropped index ${idx.name}`);
            }
        }

        console.log('Index repair completed.');
        process.exit(0);
    } catch (err) {
        console.error('Check Error:', err.message);
        console.error(err.stack);
        process.exit(1);
    }
}

check();
