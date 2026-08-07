const inventoryService = require('../services/inventory.service');
const { updateStockSchema, reserveInventorySchema } = require('../validators/inventory.validator');

class InventoryController {
  async getAvailability(req, res, next) {
    try {
      const inventory = await inventoryService.getAvailability(req.params.productId);
      res.status(200).json({ success: true, data: inventory });
    } catch (error) {
      next(error);
    }
  }

  async updateStock(req, res, next) {
    try {
      const value = await updateStockSchema.validateAsync(req.body);
      const inventory = await inventoryService.updateStock(req.params.productId, value.quantity);
      res.status(200).json({ success: true, data: inventory });
    } catch (error) {
      next(error);
    }
  }

  async reserveInventory(req, res, next) {
    try {
      const value = await reserveInventorySchema.validateAsync(req.body);
      const result = await inventoryService.reserveInventory(value.orderId, value.items);
      res.status(200).json(result);
    } catch (error) {
      if (error.name === 'ConditionalCheckFailedException') {
        return res.status(400).json({ success: false, message: 'Insufficient stock available' });
      }
      next(error);
    }
  }

  async releaseInventory(req, res, next) {
    try {
      const value = await reserveInventorySchema.validateAsync(req.body);
      const result = await inventoryService.releaseInventory(value.orderId, value.items);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new InventoryController();
