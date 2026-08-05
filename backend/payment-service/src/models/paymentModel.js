const { v4: uuidv4 } = require('uuid');

function newPayment(input) {
  const now = new Date().toISOString();
  return {
    paymentId: uuidv4(),
    orderId: input.orderId,
    userId: input.userId,
    amount: input.amount,
    currency: input.currency || 'USD',
    status: input.status || 'PENDING',
    paymentMethod: input.paymentMethod || 'CREDIT_CARD',
    transactionId: null,
    createdAt: now,
    updatedAt: now,
    version: 1
  };
}

module.exports = { newPayment };