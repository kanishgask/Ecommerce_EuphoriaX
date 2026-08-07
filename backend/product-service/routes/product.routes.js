const express = require('express');
const productController = require('../controllers/product.controller');

const router = express.Router();

router.post('/', productController.createProduct);
router.get('/', productController.searchProducts);
router.get('/:id', productController.getProductById);
router.put('/:id', productController.updateProduct);
router.delete('/:id', productController.deleteProduct);

module.exports = router;
