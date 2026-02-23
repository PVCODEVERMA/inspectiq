const express = require('express');
const router = express.Router();
const weldingAuditController = require('../../controllers/consultancy/weldingAuditController');
const auth = require('../../middleware/auth');

router.post('/', auth, weldingAuditController.createReport);
router.get('/', auth, weldingAuditController.getAllReports);
router.get('/:id', auth, weldingAuditController.getReportById);
router.put('/:id', auth, weldingAuditController.updateReport);
router.delete('/:id', auth, weldingAuditController.deleteReport);

module.exports = router;
