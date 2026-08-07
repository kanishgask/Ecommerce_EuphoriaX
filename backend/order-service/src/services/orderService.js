const repo = require('../repositories/orderRepository');
const { newOrder, canTransition } = require('../models/orderModel');
const cartClient = require('./cartClient');
const { publishOrderEvent } = require('./eventPublisher');
const { AppError } = require('../middleware/errorHandler');

// Deliberate design tradeoff: Order starts in a pending/unconfirmed state.
// Downstream services drive status transitions via events.
// No automatic rollback/compensation is implemented yet.
async function checkout(userId, accessToken, { shippingAddress }) {
  const cart = await cartClient.getCart(accessToken);
  if (!cart.items || cart.items.length === 0) {
    throw new AppError('Cart is empty', 422);
  }

  const items = cart.items.map((it) => ({
    productId: it.productId,
    name: it.name,
    price: it.price,
    quantity: it.quantity,
    currency: it.currency
  }));

  const order = newOrder({ userId, items, shippingAddress, currency: items[0].currency });
  await repo.create(order);
  await publishOrderEvent('OrderPlaced', order);
  await cartClient.clearCart(accessToken);

  return order;
}

async function getOrder(orderId, requester) {
  const order = await repo.getById(orderId);
  if (!order) throw new AppError('Order not found', 404);

  const isOwner = order.userId === requester.sub;
  const isAdmin = requester.groups.includes('ADMIN');
  if (!isOwner && !isAdmin) throw new AppError('Forbidden', 403);

  return order;
}

async function listMyOrders(userId, query) {
  return repo.listByUser(userId, query);
}

async function listAllOrders(query) {
  return repo.listAll(query);
}

async function updateStatus(orderId, newStatus, expectedVersion) {
  const order = await repo.getById(orderId);
  if (!order) throw new AppError('Order not found', 404);

  if (!canTransition(order.status, newStatus)) {
    throw new AppError(`Cannot transition order from ${order.status} to ${newStatus}`, 422);
  }

  try {
    const updated = await repo.updateStatus(orderId, newStatus, expectedVersion);
    await publishOrderEvent('OrderStatusChanged', updated);
    return updated;
  } catch (err) {
    if (err.name === 'ConditionalCheckFailedException') {
      throw new AppError('Order was modified elsewhere. Please refresh and retry.', 409);
    }
    throw err;
  }
}

module.exports = { checkout, getOrder, listMyOrders, listAllOrders, updateStatus };
