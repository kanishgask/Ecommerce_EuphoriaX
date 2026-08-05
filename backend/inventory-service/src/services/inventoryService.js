const inventoryRepo = require('../repositories/inventoryRepository');
const { newInventory } = require('../models/inventoryModel');
const logger = require('../utils/logger');

async function getInventory(productId) {
  return await inventoryRepo.getByProductId(productId);
}

async function createInventory(data) {
  const inv = newInventory(data);
  return await inventoryRepo.create(inv);
}

async function adjustStock(productId, adjustment, reason) {
  const inv = await inventoryRepo.getByProductId(productId);
  if (!inv) throw new Error('Inventory not found');
  
  const newStock = inv.stock + adjustment;
  if (newStock < 0) throw new Error('Insufficient stock');
  
  const historyEntry = {
    date: new Date().toISOString(),
    adjustment,
    newStock,
    reason
  };
  
  const updated = await inventoryRepo.updateStock(productId, newStock, historyEntry, inv.version);
  
  // TODO: Publish SNS/SQS event if low stock
  if (updated.stock <= updated.lowStockThreshold) {
    logger.info(`Low stock alert for product ${productId}`);
    // Publish LowStock event...
  }
  
  return updated;
}

module.exports = { getInventory, createInventory, adjustStock };