const express = require('express');
const router = express.Router();
const controller = require('../../controllers/ndt/liquidPenetrantController');
const auth = require('../../middleware/auth');

router.post('/', auth, controller.createReport);
router.get('/', auth, controller.getAllReports);
router.get('/:id', auth, controller.getReportById);
router.put('/:id', auth, controller.updateReport);
router.get('/next-report-no', auth, controller.getNextReportNo);
router.delete('/:id', auth, controller.deleteReport);

module.exports = router;
