const notificationService = require('../services/notification.service');
const { sendOrderConfirmationSchema, sendPaymentConfirmationSchema } = require('../validators/notification.validator');

class NotificationController {
  async sendOrderConfirmation(req, res, next) {
    try {
      const value = await sendOrderConfirmationSchema.validateAsync(req.body);
      const result = await notificationService.sendOrderConfirmation(value);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async sendPaymentConfirmation(req, res, next) {
    try {
      const value = await sendPaymentConfirmationSchema.validateAsync(req.body);
      const result = await notificationService.sendPaymentConfirmation(value);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new NotificationController();
