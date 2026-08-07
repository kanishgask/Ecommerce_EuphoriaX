const express = require('express');
const notificationController = require('../controllers/notification.controller');

const router = express.Router();

// In a real scenario, these routes would be protected via IAM or internal VPC access 
// since they should only be triggered by SQS or other trusted internal services.
router.post('/order-confirmation', notificationController.sendOrderConfirmation);
router.post('/payment-confirmation', notificationController.sendPaymentConfirmation);

module.exports = router;
