const express = require('express');
const inventoryController = require('../controllers/inventory.controller');

const router = express.Router();

router.get('/:productId', inventoryController.getAvailability);
router.put('/:productId', inventoryController.updateStock);

// These endpoints simulate the events for now. Will be integrated with SNS/SQS later.
router.post('/reserve', inventoryController.reserveInventory);
router.post('/release', inventoryController.releaseInventory);

module.exports = router;
