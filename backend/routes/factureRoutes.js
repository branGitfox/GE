const express = require("express");
const factureController = require("../controllers/factureController");

const router = express.Router();

router.post("/", factureController.createFacture);
router.get("/", factureController.getAllFactures);
router.get("/stats", factureController.getDashboardStats);
router.get("/sold-products", factureController.getSoldProducts);
router.get("/top-suppliers", factureController.getTopSuppliers);
router.get("/financial-stats", factureController.getFinancialStats);
// router.put("/:id/annuler", factureController.annulerFacture);
// router.put("/:id/modifier", factureController.modifierFacture);

router.put('/:id', factureController.updateFacture);
router.delete('/:id', factureController.deleteFacture);
router.put('/:id/convert', factureController.convertProformaToFacture);
router.put('/:id/pay', factureController.addPayment);

module.exports = router;