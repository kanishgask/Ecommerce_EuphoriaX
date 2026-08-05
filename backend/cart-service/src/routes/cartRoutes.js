const express = require('express');
const controller = require('../controllers/cartController');
const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/authenticate');
const { addItemSchema, updateQuantitySchema } = require('../validators/cartValidators');

const router = express.Router();
router.use(authenticate);

router.get('/', controller.getCart);
router.post('/items', validate(addItemSchema), controller.addItem);
router.patch('/items/:productId', validate(updateQuantitySchema), controller.updateQuantity);
router.delete('/items/:productId', controller.removeItem);
router.delete('/', controller.clearCart);

module.exports = router;
