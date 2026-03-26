const express = require('express');
const router = express.Router();
const exportController = require('../controllers/exportController');

// Route pour l'export Excel complet
router.get('/excel', exportController.exportToExcel);

module.exports = router;
