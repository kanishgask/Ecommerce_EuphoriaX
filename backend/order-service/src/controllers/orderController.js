const service = require('../services/orderService');
const { success } = require('../utils/response');

function extractToken(req) {
  const header = req.headers.authorization || '';
  return header.startsWith('Bearer ') ? header.slice(7) : null;
}

async function checkout(req, res, next) {
  try {
    const order = await service.checkout(req.user.sub, extractToken(req), req.body);
    return success(res, 201, order, 'Order placed successfully');
  } catch (err) { next(err); }
}

async function getOrder(req, res, next) {
  try {
    const order = await service.getOrder(req.params.orderId, req.user);
    return success(res, 200, order);
  } catch (err) { next(err); }
}

async function listMyOrders(req, res, next) {
  try {
    const { limit, cursor } = req.query;
    const result = await service.listMyOrders(req.user.sub, { limit: limit ? Number(limit) : undefined, cursor });
    return success(res, 200, result);
  } catch (err) { next(err); }
}

async function listAllOrders(req, res, next) {
  try {
    const { limit, cursor } = req.query;
    const result = await service.listAllOrders({ limit: limit ? Number(limit) : undefined, cursor });
    return success(res, 200, result);
  } catch (err) { next(err); }
}

async function updateStatus(req, res, next) {
  try {
    const { status, version } = req.body;
    const updated = await service.updateStatus(req.params.orderId, status, version);
    return success(res, 200, updated, 'Order status updated');
  } catch (err) { next(err); }
}

module.exports = { checkout, getOrder, listMyOrders, listAllOrders, updateStatus };
