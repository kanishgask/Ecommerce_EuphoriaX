const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/paymentController');

router.post('/', ctrl.create);
router.post('/:paymentId/verify', ctrl.verify);
router.post('/:paymentId/refund', ctrl.refund);

module.exports = router;