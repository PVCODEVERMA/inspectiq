const mongoose = require('mongoose');
require('dotenv').config();
const Service = require('./models/Service');
const User = require('./models/User');

const initialServices = [
    { name: 'THIRD PARTY INSPECTION', description: 'Comprehensive third-party inspection services' },
    { name: 'WELDING CONSULTANCY', description: 'Expert welding consultancy and advice' },
    { name: 'TRAINING & CERTIFICATIONS', description: 'Professional training and industry certifications' },
    { name: 'NDT SERVICES', description: 'Non-Destructive Testing services' },
    { name: 'PWHT SERVICES', description: 'Post Weld Heat Treatment services' },
    { name: 'INDUSTRIAL SAFETY', description: 'Industrial safety audits and training' },
    { name: 'PMI SERVICES', description: 'Positive Material Identification' },
    { name: 'ENVIRONMENTAL SURVEY', description: 'Environmental surveys and compliance' },
    { name: 'ISO CERTIFICATIONS', description: 'Assistant with ISO certification processes' }
];

async function seed() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('DB Connected');

        const masterAdmin = await User.findOne({ role: 'master_admin' });
        if (!masterAdmin) {
            console.error('Master Admin not found. Please register Master Admin first.');
            process.exit(1);
        }

        for (const s of initialServices) {
            const exists = await Service.findOne({ name: s.name });
            if (!exists) {
                const service = new Service({
                    ...s,
                    createdBy: masterAdmin._id
                });
                await service.save();
                console.log(`Added service: ${s.name}`);
            } else {
                console.log(`Service already exists: ${s.name}`);
            }
        }

        console.log('Seeding completed.');
        process.exit(0);
    } catch (err) {
        console.error('Seed Error:', err);
        process.exit(1);
    }
}

seed();
