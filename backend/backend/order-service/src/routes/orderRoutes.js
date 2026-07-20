const express = require('express');
const controller = require('../controllers/orderController');
const validate = require('../middleware/validate');
const { authenticate, requireRole } = require('../middleware/authenticate');
const { checkoutSchema, updateOrderStatusSchema } = require('../validators/orderValidators');

const router = express.Router();
router.use(authenticate);

router.post('/checkout', validate(checkoutSchema), controller.checkout);
router.get('/mine', controller.listMyOrders);
router.get('/:orderId', controller.getOrder);

// Admin
router.get('/', requireRole('ADMIN'), controller.listAllOrders);
router.patch('/:orderId/status', requireRole('ADMIN'), validate(updateOrderStatusSchema), controller.updateStatus);

module.exports = router;
