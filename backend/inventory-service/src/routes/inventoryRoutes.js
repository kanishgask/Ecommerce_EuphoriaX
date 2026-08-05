const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/inventoryController');

router.get('/:productId', ctrl.get);
router.post('/', ctrl.create);
router.post('/:productId/adjust', ctrl.adjust);

module.exports = router;