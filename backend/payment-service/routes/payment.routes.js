const express = require('express');
const paymentController = require('../controllers/payment.controller');
const { requireAuth } = require('../middlewares/auth.middleware');

const router = express.Router();

// Require Auth for all payment routes
router.use(requireAuth);

router.post('/process', paymentController.processPayment);
router.get('/order/:orderId', paymentController.getPaymentHistoryByOrderId);
router.get('/history', paymentController.getPaymentHistoryByUser);

module.exports = router;
