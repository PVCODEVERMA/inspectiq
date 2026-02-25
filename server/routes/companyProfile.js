const express = require('express');
const router = express.Router();
const companyProfileController = require('../controllers/companyProfileController');
const auth = require('../middleware/auth');
const { masterAdminOnly } = require('../middleware/roleAuth');

// All company profile routes are restricted to master admins
router.get('/', auth, masterAdminOnly, companyProfileController.getCompanyProfile);
router.put('/', auth, masterAdminOnly, companyProfileController.updateCompanyProfile);

module.exports = router;
