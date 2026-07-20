const repo = require('../repositories/cartRepository');
const { fetchProduct } = require('./productClient');
const { newCartItem } = require('../models/cartModel');
const { AppError } = require('../middleware/errorHandler');

async function getCart(userId) {
  const items = await repo.getCart(userId);
  const subtotal = items.reduce((sum, it) => sum + it.price * it.quantity, 0);
  return { items, itemCount: items.reduce((n, it) => n + it.quantity, 0), subtotal: Number(subtotal.toFixed(2)) };
}

async function addItem(userId, { productId, quantity }) {
  const existing = await repo.getItem(userId, productId);
  if (existing) {
    const updated = await repo.updateQuantity(userId, productId, Math.min(existing.quantity + quantity, 99));
    return updated;
  }

  const product = await fetchProduct(productId);
  if (product.status !== 'ACTIVE') throw new AppError('Product is not available for purchase', 422);

  const item = newCartItem({
    userId,
    productId,
    name: product.name,
    price: product.price,
    currency: product.currency,
    image: product.images && product.images[0],
    quantity
  });
  return repo.putItem(item);
}

async function updateQuantity(userId, productId, quantity) {
  try {
    return await repo.updateQuantity(userId, productId, quantity);
  } catch (err) {
    if (err.name === 'ConditionalCheckFailedException') {
      throw new AppError('Item is not in the cart', 404);
    }
    throw err;
  }
}

async function removeItem(userId, productId) {
  await repo.removeItem(userId, productId);
  return true;
}

async function clearCart(userId) {
  await repo.clearCart(userId);
  return true;
}

module.exports = { getCart, addItem, updateQuantity, removeItem, clearCart };
