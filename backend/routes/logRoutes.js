const express = require('express');
const router = express.Router();
const logController = require('../controllers/logController');
const authenticateToken = require('../middleware/authenticateToken');

router.get('/', authenticateToken, logController.getAllLogs);

module.exports = router;
