const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Import Routes
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const profileRoutes = require('./routes/profile');
const inspectionRoutes = require('./routes/inspections');
const uploadRoutes = require('./routes/upload');
const registrationKeyRoutes = require('./routes/registrationKeys');
const serviceRoutes = require('./routes/services');
const clientRoutes = require('./routes/clients');
const userRoutes = require('./routes/users'); // New import for user routes
const ultrasonicRoutes = require('./routes/ndt/ultrasonic');
const magneticParticleRoutes = require('./routes/ndt/magneticParticle');
const liquidPenetrantRoutes = require('./routes/ndt/liquidPenetrant');
const ndtSummaryRoutes = require('./routes/ndt/ndtSummary');
const engineeringRoutes = require('./routes/tpi/engineering');
const weldingAuditRoutes = require('./routes/consultancy/weldingAssessmentAudit');

// Use Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/inspections', inspectionRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/registration-keys', registrationKeyRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/users', userRoutes);

// NDT Modular Routes
app.use('/api/ndt/ultrasonic', ultrasonicRoutes);
app.use('/api/ndt/magnetic-particle', magneticParticleRoutes);
app.use('/api/ndt/liquid-penetrant', liquidPenetrantRoutes);
app.use('/api/ndt/summary', ndtSummaryRoutes);

// TPI Modular Routes
app.use('/api/tpi/engineering', engineeringRoutes);

// Consultancy Modular Routes
app.use('/api/consultancy/welding-audit', weldingAuditRoutes);

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error('SERVER ERROR:', err.message);
    console.error('STACK:', err.stack);
    res.status(err.status || 500).json({
        message: err.message || 'Internal Server Error',
        error: process.env.NODE_ENV === 'development' ? err : {}
    });
});

// Serve uploads directory
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Basic Route
app.get('/', (req, res) => {
    res.send('QCWS Inspection API is running...');
});

// Database Connection
mongoose.connect(process.env.MONGODB_URI)
    .then(async () => {
        console.log('Connected to MongoDB');

        // Migrate report_no index to sparse (one-time, safe to run repeatedly)
        try {
            const LPT = require('./models/ndt/LiquidPenetrantInspection');
            const collection = LPT.collection;
            const indexes = await collection.indexes();
            const oldIndex = indexes.find(idx => idx.key && idx.key.report_no === 1 && !idx.sparse);
            if (oldIndex) {
                await collection.dropIndex(oldIndex.name);
                await collection.createIndex({ report_no: 1 }, { unique: true, sparse: true });
                console.log('[MIGRATION] report_no index updated to sparse');
            }
        } catch (migErr) {
            console.warn('[MIGRATION] report_no index migration skipped:', migErr.message);
        }

        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch(err => {
        console.error('Database connection error:', err);
    });
