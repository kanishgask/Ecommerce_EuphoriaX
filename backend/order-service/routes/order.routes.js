const express = require('express');
const orderController = require('../controllers/order.controller');
const { requireAuth } = require('../middlewares/auth.middleware');

const router = express.Router();

// Publicly accessible for webhook/SQS (in a real scenario, protect via IAM or API key)
router.patch('/:id/status', orderController.updateOrderStatus);

// User protected routes
router.use(requireAuth);

router.post('/', orderController.createOrder);
router.get('/', orderController.getUserOrders);
router.get('/:id', orderController.getOrderById);

module.exports = router;
