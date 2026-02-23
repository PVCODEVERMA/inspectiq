const Client = require('../models/Client');

// Create a new client
exports.createClient = async (req, res) => {
    try {
        console.log('Received Create Client Request:', req.body);
        const { name, address, contact_person, email, phone, gst_number } = req.body;

        // Check if client already exists
        const existingClient = await Client.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
        if (existingClient) {
            return res.status(400).json({ message: 'Client with this name already exists' });
        }

        const clientData = {
            name,
            address,
            contact_person: contact_person || undefined,
            email: email || undefined,
            phone: phone || undefined,
            gst_number: gst_number || undefined,
            created_by: req.user.id
        };

        const newClient = new Client(clientData);

        const savedClient = await newClient.save();
        res.status(201).json(savedClient);
    } catch (error) {
        console.error('Error in createClient:', error);
        res.status(500).json({ message: error.message });
    }
};

// Get all clients
exports.getAllClients = async (req, res) => {
    try {
        const clients = await Client.find().sort({ createdAt: -1 });
        res.status(200).json(clients);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get client by ID
exports.getClientById = async (req, res) => {
    try {
        const client = await Client.findById(req.params.id);
        if (!client) {
            return res.status(404).json({ message: 'Client not found' });
        }
        res.status(200).json(client);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update client
exports.updateClient = async (req, res) => {
    try {
        const { name, address, contact_person, email, phone, gst_number } = req.body;

        const updateData = {
            name,
            address,
            contact_person: contact_person || undefined,
            email: email || undefined,
            phone: phone || undefined,
            gst_number: gst_number || undefined
        };

        const updatedClient = await Client.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!updatedClient) {
            return res.status(404).json({ message: 'Client not found' });
        }

        res.status(200).json(updatedClient);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete client
exports.deleteClient = async (req, res) => {
    try {
        const deletedClient = await Client.findByIdAndDelete(req.params.id);
        if (!deletedClient) {
            return res.status(404).json({ message: 'Client not found' });
        }
        res.status(200).json({ message: 'Client deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
