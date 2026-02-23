const express = require('express');
const router = express.Router();
const inspectionController = require('../controllers/inspectionController');
const auth = require('../middleware/auth');

// Public verification endpoint - NO auth middleware
router.get('/verify/:token', inspectionController.verifyInspection);

router.use(auth); // All other inspection routes require auth

router.post('/', inspectionController.createInspection);
router.get('/', inspectionController.getAllInspections);
router.get('/:id', inspectionController.getInspectionById);
router.put('/:id', inspectionController.updateInspection);
router.delete('/:id', inspectionController.deleteInspection);

module.exports = router;
