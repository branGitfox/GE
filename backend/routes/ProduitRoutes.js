const express = require('express');
const router = express.Router();
const produitController = require('../controllers/produitController');

// Routes pour les produits
router.get('/produits', produitController.getAllProduits);
router.get('/produits/recent', produitController.getRecentProduits);
router.post('/produits', produitController.createProduit);
router.put('/produits/:id', produitController.updateProduit);
router.delete('/produits/:id', produitController.deleteProduit);
router.get('/produits/unlinked-purchases', produitController.getUnlinkedPurchases);
router.put('/produits/:id/add', produitController.addQuantite);
router.put('/produits/:id/remove', produitController.removeQuantite);
module.exports = router;