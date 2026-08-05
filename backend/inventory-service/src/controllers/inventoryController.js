const inventoryService = require('../services/inventoryService');

async function get(req, res, next) {
  try {
    const item = await inventoryService.getInventory(req.params.productId);
    if (!item) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: item });
  } catch (err) { next(err); }
}

async function create(req, res, next) {
  try {
    const item = await inventoryService.createInventory(req.body);
    res.status(201).json({ success: true, data: item });
  } catch (err) { next(err); }
}

async function adjust(req, res, next) {
  try {
    const { adjustment, reason } = req.body;
    const item = await inventoryService.adjustStock(req.params.productId, adjustment, reason);
    res.json({ success: true, data: item });
  } catch (err) { next(err); }
}

module.exports = { get, create, adjust };