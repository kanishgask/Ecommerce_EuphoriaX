/**
 * DynamoDB item shape for the Orders table.
 * Table: ORDERS_TABLE_NAME
 * PK: orderId
 * GSI1 (UserOrdersIndex): userId (HASH), createdAt (RANGE) — order history
 *
 * {
 *   orderId, userId, items: [{productId,name,price,quantity,currency}],
 *   subtotal, tax, shippingFee, total, currency,
 *   shippingAddress, status, statusHistory: [{status, at}],
 *   createdAt, updatedAt, version
 * }
 */
const { v4: uuidv4 } = require('uuid');

const TAX_RATE = 0.0; // capstone default; adjust per jurisdiction
const FLAT_SHIPPING_FEE = 0;

function newOrder({ userId, items, shippingAddress, currency = 'USD' }) {
  const now = new Date().toISOString();
  const subtotal = items.reduce((sum, it) => sum + it.price * it.quantity, 0);
  const tax = Number((subtotal * TAX_RATE).toFixed(2));
  const shippingFee = FLAT_SHIPPING_FEE;
  const total = Number((subtotal + tax + shippingFee).toFixed(2));

  return {
    orderId: uuidv4(),
    userId,
    items,
    subtotal: Number(subtotal.toFixed(2)),
    tax,
    shippingFee,
    total,
    currency,
    shippingAddress,
    status: 'PENDING_PAYMENT',
    statusHistory: [{ status: 'PENDING_PAYMENT', at: now }],
    createdAt: now,
    updatedAt: now,
    version: 1
  };
}

// Order state machine — only these transitions are permitted.
const TRANSITIONS = {
  PENDING_PAYMENT: ['PAID', 'CANCELLED'],
  PAID: ['PROCESSING', 'CANCELLED'],
  PROCESSING: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['DELIVERED'],
  DELIVERED: [],
  CANCELLED: []
};

function canTransition(from, to) {
  return (TRANSITIONS[from] || []).includes(to);
}

module.exports = { newOrder, TRANSITIONS, canTransition };
