const express = require('express');
const notificationController = require('../controllers/notification.controller');
const { requireAuth } = require('../middlewares/auth.middleware');

const router = express.Router();

/**
 * Internal notification endpoints.
 * 
 * These routes are triggered by internal services (order-service, payment-service)
 * via SQS or direct internal calls. They require a valid JWT token issued by
 * Cognito (for the service-to-service call) to prevent public abuse.
 * 
 * In production these should be further restricted via API Gateway resource policies
 * or AWS IAM authorizers to allow only internal Lambda invocations.
 */

/**
 * @swagger
 * /order-confirmation:
 *   post:
 *     summary: Send order confirmation email (internal service use only)
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 */
router.post('/order-confirmation', requireAuth, notificationController.sendOrderConfirmation);

/**
 * @swagger
 * /payment-confirmation:
 *   post:
 *     summary: Send payment confirmation email (internal service use only)
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 */
router.post('/payment-confirmation', requireAuth, notificationController.sendPaymentConfirmation);

module.exports = router;
