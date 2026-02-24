const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env from parent directory
dotenv.config({ path: path.join(__dirname, '../.env') });

async function fixIndexes() {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI not found in .env');
        }

        console.log('Connecting to DB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB successfully.');

        const db = mongoose.connection.db;
        const collection = db.collection('liquidpenetrantinspections');

        console.log('Fetching current indexes...');
        const indexes = await collection.indexes();
        console.log('Current indexes:', JSON.stringify(indexes, null, 2));

        // 1. Drop the problematic reportNo index if it exists
        const hasReportNoIndex = indexes.some(idx => idx.name === 'reportNo_1');
        if (hasReportNoIndex) {
            console.log('Dropping reportNo_1 index...');
            await collection.dropIndex('reportNo_1');
            console.log('reportNo_1 index dropped.');
        } else {
            console.log('reportNo_1 index not found.');
        }

        // 2. Drop the report_no index if it's not sparse or has issues
        const hasReportNoSnakeIndex = indexes.some(idx => idx.name === 'report_no_1');
        if (hasReportNoSnakeIndex) {
            console.log('Dropping existing report_no_1 index to recreate as sparse...');
            await collection.dropIndex('report_no_1');
        }

        // 3. Create a clean sparse unique index on report_no
        console.log('Creating sparse unique index on report_no...');
        await collection.createIndex({ report_no: 1 }, { unique: true, sparse: true, name: 'report_no_1' });
        console.log('Sparse unique index on report_no created.');

        console.log('Index fix completed successfully.');

    } catch (err) {
        console.error('Index Fix Failed:', err);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from DB.');
    }
}

fixIndexes();
