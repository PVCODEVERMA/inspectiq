const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const auth = require('../middleware/auth');

const { masterAdminOnly } = require('../middleware/roleAuth');

router.get('/users', auth, masterAdminOnly, adminController.getAllUsers);
router.get('/users/:id', auth, masterAdminOnly, adminController.getUserById);
router.put('/users/:id', auth, masterAdminOnly, adminController.updateUser);
router.get('/stats', auth, masterAdminOnly, adminController.getAdminStats);

module.exports = router;
