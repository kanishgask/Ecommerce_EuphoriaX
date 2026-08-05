const service = require('../services/cartService');
const { success } = require('../utils/response');

async function getCart(req, res, next) {
  try {
    const cart = await service.getCart(req.user.sub);
    return success(res, 200, cart);
  } catch (err) { next(err); }
}

async function addItem(req, res, next) {
  try {
    const item = await service.addItem(req.user.sub, req.body);
    return success(res, 201, item, 'Item added to cart');
  } catch (err) { next(err); }
}

async function updateQuantity(req, res, next) {
  try {
    const item = await service.updateQuantity(req.user.sub, req.params.productId, req.body.quantity);
    return success(res, 200, item, 'Quantity updated');
  } catch (err) { next(err); }
}

async function removeItem(req, res, next) {
  try {
    await service.removeItem(req.user.sub, req.params.productId);
    return success(res, 200, null, 'Item removed from cart');
  } catch (err) { next(err); }
}

async function clearCart(req, res, next) {
  try {
    await service.clearCart(req.user.sub);
    return success(res, 200, null, 'Cart cleared');
  } catch (err) { next(err); }
}

module.exports = { getCart, addItem, updateQuantity, removeItem, clearCart };
