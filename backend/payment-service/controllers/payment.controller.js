const paymentService = require('../services/payment.service');
const { processPaymentSchema } = require('../validators/payment.validator');

class PaymentController {
  async processPayment(req, res, next) {
    try {
      const value = await processPaymentSchema.validateAsync(req.body);

      // SECURITY: userId is ALWAYS taken from the verified JWT token.
      // It must never be accepted from the request body to prevent privilege escalation.
      const userId = req.user.sub;

      const paymentRecord = await paymentService.processPayment({ ...value, userId });
      res.status(200).json({ success: true, data: paymentRecord });
    } catch (error) {
      next(error);
    }
  }

  async getPaymentHistoryByOrderId(req, res, next) {
    try {
      const orderId = req.params.orderId;
      // SECURITY: Fetch payment and verify it belongs to the authenticated user
      const history = await paymentService.getPaymentHistoryByOrderId(orderId);

      // Filter to only return payments belonging to the requesting user (unless admin)
      const isAdmin = req.user['cognito:groups']?.includes('admin');
      const filteredHistory = isAdmin
        ? history
        : history.filter(p => p.userId === req.user.sub);

      if (!isAdmin && filteredHistory.length === 0) {
        return res.status(403).json({ success: false, message: 'Forbidden: you do not own this resource' });
      }

      res.status(200).json({ success: true, data: filteredHistory });
    } catch (error) {
      next(error);
    }
  }

  async getPaymentHistoryByUser(req, res, next) {
    try {
      // SECURITY: userId always comes from the JWT — users can only see their own history
      const userId = req.user.sub;
      const history = await paymentService.getPaymentHistoryByUser(userId);
      res.status(200).json({ success: true, data: history });
    } catch (error) {
      next(error);
    }
  }

  async getAllPayments(req, res, next) {
    try {
      // SECURITY: Only admin role can access all payments
      const isAdmin = req.user['cognito:groups']?.includes('admin');
      if (!isAdmin) {
        return res.status(403).json({ success: false, message: 'Forbidden: admin access required' });
      }
      const payments = await paymentService.getAllPayments();
      res.status(200).json({ success: true, data: payments });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new PaymentController();
