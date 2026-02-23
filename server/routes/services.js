const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');
const auth = require('../middleware/auth');

const { isAdmin } = require('../middleware/roleAuth');

// Public/All authenticated users: Get active services
router.get('/active', auth, serviceController.getActiveServices);

// Admin only: CRUD services
router.get('/', auth, isAdmin, serviceController.getAllServices);
router.get('/details/:id', auth, isAdmin, serviceController.getServiceDetails);
router.post('/', auth, isAdmin, serviceController.createService);
router.put('/:id', auth, isAdmin, serviceController.updateService);
router.delete('/:id', auth, isAdmin, serviceController.deleteService);

module.exports = router;
