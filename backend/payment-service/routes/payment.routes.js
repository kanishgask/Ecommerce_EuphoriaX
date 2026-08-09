const express = require('express');
const paymentController = require('../controllers/payment.controller');
const { requireAuth } = require('../middlewares/auth.middleware');

const router = express.Router();

// Require Auth for all payment routes
router.use(requireAuth);

/**
 * @swagger
 * /process:
 *   post:
 *     summary: Process a payment manually
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               orderId:
 *                 type: string
 *               amount:
 *                 type: number
 *               paymentMethod:
 *                 type: object
 *     responses:
 *       200:
 *         description: Payment processed
 */
router.post('/process', paymentController.processPayment);

/**
 * @swagger
 * /order/{orderId}:
 *   get:
 *     summary: Get payment history for an order
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Payment history
 */
router.get('/order/:orderId', paymentController.getPaymentHistoryByOrderId);

/**
 * @swagger
 * /history:
 *   get:
 *     summary: Get payment history for current user
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User payment history
 */
router.get('/history', paymentController.getPaymentHistoryByUser);
router.get('/all', paymentController.getAllPayments);

module.exports = router;
