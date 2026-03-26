const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/entrepotController');

// Entrepots CRUD
router.get('/', ctrl.getAllEntrepots);
router.post('/', ctrl.createEntrepot);
router.put('/:id', ctrl.updateEntrepot);
router.delete('/:id', ctrl.deleteEntrepot);

// Liaison produit <-> entrepôts
router.get('/produit/:produitId', ctrl.getEntrepotsForProduit);
router.put('/produit/:produitId', ctrl.setEntrepotsForProduit);

// Liaison produit <-> fournisseurs N:N
router.put('/produit/:produitId/fournisseurs', ctrl.setFournisseursForProduit);

module.exports = router;
