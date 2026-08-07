const express = require('express');
const orderController = require('../controllers/order.controller');
const { requireAuth } = require('../middlewares/auth.middleware');

const router = express.Router();

// Publicly accessible for webhook/SQS (in a real scenario, protect via IAM or API key)
/**
 * @swagger
 * /orders/{id}/status:
 *   patch:
 *     summary: Update order status (Webhook)
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Success
 */
router.patch('/:id/status', orderController.updateOrderStatus);

// User protected routes
router.use(requireAuth);

/**
 * @swagger
 * /orders:
 *   post:
 *     summary: Create a new order
 *     tags: [Orders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *               shippingAddress:
 *                 type: string
 *     responses:
 *       200:
 *         description: Success
 */
router.post('/', orderController.createOrder);

/**
 * @swagger
 * /orders:
 *   get:
 *     summary: Get user's orders
 *     tags: [Orders]
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/', orderController.getUserOrders);

/**
 * @swagger
 * /orders/{id}:
 *   get:
 *     summary: Get order by ID
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/:id', orderController.getOrderById);

module.exports = router;
