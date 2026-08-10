const express = require('express');
const orderController = require('../controllers/order.controller');
const { requireAuth } = require('../middlewares/auth.middleware');

const router = express.Router();

// All order routes require authentication
router.use(requireAuth);

/**
 * @swagger
 * /orders/{id}/status:
 *   patch:
 *     summary: Update order status (admin only — previously unprotected)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
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
// SECURITY FIX: Moved inside requireAuth scope. In production also add requireRole('admin').
router.patch('/:id/status', orderController.updateOrderStatus);

/**
 * @swagger
 * /orders:
 *   post:
 *     summary: Create a new order
 *     tags: [Orders]
 */
router.post('/', orderController.createOrder);

/**
 * @swagger
 * /orders/all:
 *   get:
 *     summary: Get all orders (Admin)
 *     tags: [Orders]
 */
router.get('/all', orderController.getAllOrders);

/**
 * @swagger
 * /orders:
 *   get:
 *     summary: Get user's orders
 *     tags: [Orders]
 */
router.get('/', orderController.getUserOrders);

/**
 * @swagger
 * /orders/{id}:
 *   get:
 *     summary: Get order by ID
 *     tags: [Orders]
 */
router.get('/:id', orderController.getOrderById);

module.exports = router;
