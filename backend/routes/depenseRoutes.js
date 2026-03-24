const express = require('express');
const router = express.Router();
const depenseController = require('../controllers/depenseController');

// Routes pour les dépenses
router.get('/stats', depenseController.getDepensesStats);
router.get('/', depenseController.getAllDepenses);
router.post('/', depenseController.createDepense);
router.put('/:id', depenseController.updateDepense);
router.delete('/:id', depenseController.deleteDepense);

module.exports = router;
