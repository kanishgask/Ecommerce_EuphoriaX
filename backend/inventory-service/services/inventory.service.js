const inventoryRepository = require('../repositories/inventory.repository');
const eventPublisher = require('../utils/publisher');

class InventoryService {
  async getAvailability(productId) {
    return await inventoryRepository.getInventory(productId);
  }

  async updateStock(productId, quantity) {
    return await inventoryRepository.updateStock(productId, quantity);
  }

  async reserveInventory(orderId, items, userId, totalAmount) {
    const reservedItems = [];
    
    try {
      // For simplicity in this prototype, we iterate sequentially. 
      // In production, DynamoDB TransactWriteItems should be used for atomic multi-item reservations.
      for (const item of items) {
        await inventoryRepository.reserveStock(item.productId, item.quantity);
        reservedItems.push(item);
      }
      
      const result = { success: true, orderId, message: 'Inventory reserved successfully' };
      
      // Publish event
      try {
        const topicArn = process.env.SNS_INVENTORY_EVENTS_TOPIC;
        if (topicArn) {
          await eventPublisher.publish(topicArn, 'InventoryReserved', { 
            orderId, 
            items, 
            userId, 
            totalAmount 
          });
        }
      } catch (e) { console.error('Failed to publish InventoryReserved', e); }

      return result;
    } catch (error) {
      // Rollback logic if one fails
      for (const item of reservedItems) {
        await inventoryRepository.releaseStock(item.productId, item.quantity);
      }
      
      try {
        const topicArn = process.env.SNS_INVENTORY_EVENTS_TOPIC;
        if (topicArn) {
          await eventPublisher.publish(topicArn, 'InventoryFailed', { orderId });
        }
      } catch (e) { console.error('Failed to publish InventoryFailed', e); }

      const err = new Error('Insufficient stock for one or more items');
      err.statusCode = 400;
      throw err;
    }
  }

  async releaseInventory(orderId, items) {
    for (const item of items) {
      try {
        await inventoryRepository.releaseStock(item.productId, item.quantity);
      } catch (error) {
        console.error(`Failed to release stock for product ${item.productId}:`, error.message);
      }
    }
    return { success: true, orderId, message: 'Inventory released' };
  }
}

module.exports = new InventoryService();
