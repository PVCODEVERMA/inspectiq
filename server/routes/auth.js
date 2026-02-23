const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');

const multer = require('multer');
const { storage } = require('../config/cloudinary');

const upload = multer({
    storage: storage,
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/webp') {
            cb(null, true);
        } else {
            cb(new Error('Only JPG, PNG and WEBP formats are allowed'), false);
        }
    }
}).single('avatar');

router.post('/master-login', authController.masterAdminLogin);
router.post('/login', authController.login);
router.post('/register-master-admin', (req, res, next) => {
    upload(req, res, (err) => {
        if (err) return res.status(400).json({ message: err.message });
        next();
    });
}, authController.registerMasterAdmin);
router.post('/create-user', auth, authController.createUser);
router.get('/me', auth, authController.getMe);
router.post('/logout', auth, authController.logout);
router.get('/check-master-admin', authController.checkMasterAdminExists);

module.exports = router;
