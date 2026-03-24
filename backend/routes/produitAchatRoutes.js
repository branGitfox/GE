
const express = require('express');
const router = express.Router();
const produitAchatController = require('../controllers/produitAchatController');

// Route pour obtenir le stock réel par produit
router.get('/stock', produitAchatController.getStockParProduit);

router.get('/stats', produitAchatController.getProduitAchatStats);
router.get('/', produitAchatController.getAllProduitAchats);
router.post('/', produitAchatController.createProduitAchat);
router.put('/:id', produitAchatController.updateProduitAchat);
router.delete('/:id', produitAchatController.deleteProduitAchat);

module.exports = router;
