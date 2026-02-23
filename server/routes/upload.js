const express = require('express');
const router = express.Router();
const multer = require('multer');
const { storage, fileFilter } = require('../config/cloudinary');
const auth = require('../middleware/auth');

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 10000000 }, // 10MB limit
}).array("photos", 10);

router.post("/", auth, (req, res) => {
    upload(req, res, (err) => {
        if (err) {
            console.error('Upload Error:', err);
            return res.status(400).json({ message: err.message || "Upload Failed" });
        }

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: "Error: No File Selected!" });
        }

        const fileUrls = req.files.map(file => ({
            url: `/uploads/${file.filename}`, // Local file URL
            name: file.originalname,
            filename: file.filename
        }));

        res.json({
            message: "Files Uploaded Successfully!",
            files: fileUrls,
        });
    });
});

module.exports = router;
