const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

const Service = require('../models/Service');
const User = require('../models/User');

const defaultServices = [
    { name: 'THIRD PARTY INSPECTION', description: 'Comprehensive third-party inspection services for various industrial sectors.' },
    { name: 'Engineering Inspection', description: 'Specialized inspection of engineering components, machinery, and systems.' },
    { name: 'Pre-Shipment Inspection', description: 'Final inspection of goods before shipment to ensure quality and compliance.' },
    { name: 'Expediting', description: 'Ensuring timely delivery and progress of orders through supplier monitoring.' },
    { name: 'Vendor Assessment Audit', description: 'Thorough evaluation of vendor capabilities, systems, and reliability.' },
    { name: 'WELDING CONSULTANCY', description: 'Expert technical advice and quality control for welding processes and procedures.' },
    { name: 'TRAINING & CERTIFICATIONS', description: 'Professional training and certification programs for industrial personnel.' },
    { name: 'NDT SERVICES', description: 'Non-Destructive Testing services including RT, UT, MPT, and DPT.' },
    { name: 'PWHT SERVICES', description: 'Post-Weld Heat Treatment services to ensure structural integrity and stress relief.' },
    { name: 'INDUSTRIAL SAFETY', description: 'Safety audits, inspections, and consultancy for industrial environments.' },
    { name: 'PMI SERVICES', description: 'Positive Material Identification to verify chemical composition of metals.' },
    { name: 'ENVIRONMENTAL SURVEY', description: 'Monitoring and assessment of environmental parameters in industrial zones.' },
    { name: 'ISO CERTIFICATIONS', description: 'Consultacy and audit services for various ISO standard certifications.' }
];

const seedServices = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Get a master admin user to assign as creator
        const admin = await User.findOne({ role: 'master_admin' });
        if (!admin) {
            console.error('No Master Admin found. Please create one first.');
            process.exit(1);
        }

        for (const s of defaultServices) {
            const existing = await Service.findOne({ name: { $regex: new RegExp(`^${s.name}$`, 'i') } });
            if (!existing) {
                const newService = new Service({
                    ...s,
                    createdBy: admin._id
                });
                await newService.save();
                console.log(`Created service: ${s.name}`);
            } else {
                console.log(`Service already exists: ${s.name}`);
            }
        }

        console.log('Seeding completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding services:', error);
        process.exit(1);
    }
};

seedServices();
