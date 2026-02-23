const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const LiquidPenetrantInspection = require('../models/ndt/LiquidPenetrantInspection');

// Load env from parent directory
dotenv.config({ path: path.join(__dirname, '../.env') });

async function verify() {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI not found in .env');
        }

        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        const testDoc = {
            reportInfo: {
                reportNo: 'TEST-LPT-' + Date.now(),
                client: 'Verify Client',
                vendor: 'Verify Vendor'
            },
            inspectionDetails: {
                item: 'Test Item',
                inspectionLocation: 'Test Loc'
            },
            status: 'draft'
        };

        const report = new LiquidPenetrantInspection(testDoc);
        const saved = await report.save();
        console.log('Successfully saved nested document:', saved._id);
        console.log('Saved Report No:', saved.reportInfo.reportNo);

        // Clean up
        await LiquidPenetrantInspection.findByIdAndDelete(saved._id);
        console.log('Cleaned up test document');

    } catch (err) {
        console.error('Verification Failed:', err);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
    }
}

verify();
