const express = require('express');
const inventoryController = require('../controllers/inventory.controller');
const { requireAuth, requireRole } = require('../middlewares/auth.middleware');

const router = express.Router();

/**
 * @swagger
 * /{productId}:
 *   get:
 *     summary: Get inventory availability for a product (public read)
 *     tags: [Inventory]
 *     parameters:
 *       - in: path
 *         name: productId
 *         schema:
 *           type: string
 *         required: true
 *         description: The product ID
 *     responses:
 *       200:
 *         description: Inventory stock details
 *       404:
 *         description: Product not found
 */
// READ — any authenticated user can check availability
router.get('/:productId', requireAuth, inventoryController.getAvailability);

/**
 * @swagger
 * /{productId}:
 *   put:
 *     summary: Update stock for a product (admin/inventory_manager only)
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         schema:
 *           type: string
 *         required: true
 *         description: The product ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               stock:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Stock updated
 */
// WRITE — only admin or inventory_manager role can mutate stock
router.put('/:productId', requireAuth, requireRole('admin', 'inventory_manager'), inventoryController.updateStock);

/**
 * @swagger
 * /reserve:
 *   post:
 *     summary: Reserve inventory for an order (admin/inventory_manager only)
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 */
router.post('/reserve', requireAuth, requireRole('admin', 'inventory_manager'), inventoryController.reserveInventory);

/**
 * @swagger
 * /release:
 *   post:
 *     summary: Release reserved inventory for a cancelled order (admin/inventory_manager only)
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 */
router.post('/release', requireAuth, requireRole('admin', 'inventory_manager'), inventoryController.releaseInventory);

module.exports = router;
