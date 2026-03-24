const express = require('express');
const router = express.Router();
const categorieController = require('../controllers/categorieController');

router.get('/', categorieController.getAllCategories);
router.post('/', categorieController.createCategory);
router.put('/:id', categorieController.updateCategory);
router.delete('/:id', categorieController.deleteCategory);

module.exports = router;
