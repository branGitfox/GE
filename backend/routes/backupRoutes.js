const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const backupController = require('../controllers/backupController');

// Configure multer for SQL file upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        // Accept only .sql files
        if (path.extname(file.originalname).toLowerCase() === '.sql') {
            cb(null, true);
        } else {
            cb(new Error('Seuls les fichiers .sql sont acceptés'));
        }
    }
});

// Route for database backup
router.get('/export', backupController.backupDatabase);

// Route for database import/restore
router.post('/import', upload.single('sqlFile'), backupController.importDatabase);

// Route for database reset
router.post('/reset', backupController.resetDatabase);

module.exports = router;
