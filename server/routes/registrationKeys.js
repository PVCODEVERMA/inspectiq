const express = require('express');
const router = express.Router();
const registrationKeyController = require('../controllers/registrationKeyController');
const auth = require('../middleware/auth');

const { masterAdminOnly } = require('../middleware/roleAuth');

// Generate new registration key (Master Admin only)
router.post('/generate', auth, masterAdminOnly, registrationKeyController.generateKey);

// Get all registration keys (Master Admin only)
router.get('/', auth, masterAdminOnly, registrationKeyController.getAllKeys);

// Validate a registration key (public)
router.get('/validate/:key', registrationKeyController.validateKey);

module.exports = router;
