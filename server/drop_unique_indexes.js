const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/inspectiq';

const dropUniqueIndexes = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        const db = mongoose.connection.db;
        
        // List of collections to fix
        const collections = [
            'liquidpenetrantinspections',
            'magneticparticleinspections',
            'ultrasonicsinspections',
            'ndtsummaryinspections',
            'engineeringinspections',
            'weldingassessmentaudits',
            'liftinspections'
        ];

        for (const collectionName of collections) {
            try {
                const collection = db.collection(collectionName);
                const indexes = await collection.indexes();
                
                console.log(`\n[${collectionName}] Current indexes:`, indexes.length);
                
                // Find and drop unique index on report_no
                const uniqueIndex = indexes.find(
                    (idx) => idx.key && idx.key.report_no === 1 && idx.unique === true
                );

                if (uniqueIndex) {
                    console.log(`  - Found unique index: ${uniqueIndex.name}`);
                    await collection.dropIndex(uniqueIndex.name);
                    console.log(`  ✅ Dropped unique index: ${uniqueIndex.name}`);
                } else {
                    console.log(`  - No unique index found on report_no`);
                }

                // Create sparse index if not exists
                const sparseIndex = indexes.find(
                    (idx) => idx.key && idx.key.report_no === 1 && idx.sparse === true && !idx.unique
                );

                if (!sparseIndex) {
                    await collection.createIndex(
                        { report_no: 1 },
                        { sparse: true }
                    );
                    console.log(`  ✅ Created sparse index on report_no`);
                } else {
                    console.log(`  - Sparse index already exists`);
                }

            } catch (error) {
                console.error(`  ❌ Error processing ${collectionName}:`, error.message);
            }
        }

        console.log('\n✅ Index migration completed!');
        process.exit(0);

    } catch (error) {
        console.error('❌ Connection error:', error);
        process.exit(1);
    }
};

dropUniqueIndexes();
