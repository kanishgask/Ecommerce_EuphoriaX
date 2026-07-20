const { v4: uuidv4 } = require('uuid');

function newInventory(input) {
  const now = new Date().toISOString();
  return {
    productId: input.productId,
    stock: input.stock || 0,
    lowStockThreshold: input.lowStockThreshold || 10,
    history: [],
    createdAt: now,
    updatedAt: now,
    version: 1
  };
}

module.exports = { newInventory };