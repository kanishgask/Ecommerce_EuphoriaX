const express = require('express');
const inventoryController = require('../controllers/inventory.controller');

const router = express.Router();

/**
 * @swagger
 * /{productId}:
 *   get:
 *     summary: Get inventory availability for a product
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
router.get('/:productId', inventoryController.getAvailability);

/**
 * @swagger
 * /{productId}:
 *   put:
 *     summary: Update stock for a product manually
 *     tags: [Inventory]
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
router.put('/:productId', inventoryController.updateStock);

/**
 * @swagger
 * /reserve:
 *   post:
 *     summary: Reserve inventory for an order (Simulated direct call)
 *     tags: [Inventory]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               orderId:
 *                 type: string
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     productId:
 *                       type: string
 *                     quantity:
 *                       type: integer
 *     responses:
 *       200:
 *         description: Inventory reserved
 */
router.post('/reserve', inventoryController.reserveInventory);

/**
 * @swagger
 * /release:
 *   post:
 *     summary: Release reserved inventory for a cancelled order
 *     tags: [Inventory]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               orderId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Inventory released
 */
router.post('/release', inventoryController.releaseInventory);

module.exports = router;
