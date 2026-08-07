const express = require('express');
const cartController = require('../controllers/cart.controller');
const { requireAuth } = require('../middlewares/auth.middleware');

const router = express.Router();

// All cart routes require authentication
router.use(requireAuth);

router.get('/', cartController.getCart);
router.post('/items', cartController.addItem);
router.put('/items/:productId', cartController.updateQuantity);
router.delete('/items/:productId', cartController.removeItem);
router.delete('/', cartController.clearCart);

module.exports = router;
