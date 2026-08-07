const paymentService = require('../services/payment.service');
const { processPaymentSchema } = require('../validators/payment.validator');

class PaymentController {
  async processPayment(req, res, next) {
    try {
      const value = await processPaymentSchema.validateAsync(req.body);
      
      // Ensure users only pay for their own orders
      if (value.userId !== req.user.sub) {
         return res.status(403).json({ success: false, message: 'Unauthorized userId mismatch' });
      }

      const paymentRecord = await paymentService.processPayment(value);
      res.status(200).json({ success: true, data: paymentRecord });
    } catch (error) {
      next(error);
    }
  }

  async getPaymentHistoryByOrderId(req, res, next) {
    try {
      const orderId = req.params.orderId;
      const history = await paymentService.getPaymentHistoryByOrderId(orderId);
      res.status(200).json({ success: true, data: history });
    } catch (error) {
      next(error);
    }
  }

  async getPaymentHistoryByUser(req, res, next) {
    try {
      const userId = req.user.sub;
      const history = await paymentService.getPaymentHistoryByUser(userId);
      res.status(200).json({ success: true, data: history });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new PaymentController();
