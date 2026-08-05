const paymentService = require('../services/paymentService');

async function create(req, res, next) {
  try {
    const item = await paymentService.createPayment(req.body);
    res.status(201).json({ success: true, data: item });
  } catch (err) { next(err); }
}

async function verify(req, res, next) {
  try {
    const item = await paymentService.verifyPayment(req.params.paymentId);
    res.json({ success: true, data: item });
  } catch (err) { next(err); }
}

async function refund(req, res, next) {
  try {
    const item = await paymentService.processRefund(req.params.paymentId);
    res.json({ success: true, data: item });
  } catch (err) { next(err); }
}

module.exports = { create, verify, refund };