const express = require('express');
const productController = require('../controllers/product.controller');
const { requireAuth, requireRole } = require('../middlewares/auth.middleware');

const router = express.Router();

/**
 * @swagger
 * /products:
 *   post:
 *     summary: Create a new product (admin only)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 */
// WRITE operations — require authentication + admin role
router.post('/', requireAuth, requireRole('admin'), productController.createProduct);

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Get all products with pagination and filters (public)
 *     tags: [Products]
 */
// READ operations — public (anyone can browse the catalogue)
router.get('/', productController.searchProducts);

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: Get product by ID (public)
 *     tags: [Products]
 */
router.get('/:id', productController.getProductById);

/**
 * @swagger
 * /products/{id}:
 *   put:
 *     summary: Update a product (admin only)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 */
router.put('/:id', requireAuth, requireRole('admin'), productController.updateProduct);

/**
 * @swagger
 * /products/{id}:
 *   delete:
 *     summary: Delete a product (admin only)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 */
router.delete('/:id', requireAuth, requireRole('admin'), productController.deleteProduct);

module.exports = router;
