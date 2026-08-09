const { v4: uuidv4 } = require('uuid');
const paymentRepository = require('../repositories/payment.repository');
const eventPublisher = require('../utils/publisher');

class PaymentService {
  async processPayment(paymentData) {
    const { orderId, userId, amount, paymentMethod } = paymentData;

    // Removed artificial delay to prevent AWS Lambda 3-second timeout

    // Mock Business Logic: Fail if CVV is '999' for testing failure scenarios
    const isSuccess = paymentMethod.cvv !== '999';

    const paymentRecord = {
      id: uuidv4(),
      orderId,
      userId,
      amount,
      status: isSuccess ? 'SUCCESS' : 'FAILED',
      createdAt: new Date().toISOString()
    };

    await paymentRepository.savePayment(paymentRecord);

    const topicArn = process.env.SNS_PAYMENT_EVENTS_TOPIC;
    if (isSuccess) {
      if (topicArn) await eventPublisher.publish(topicArn, 'PaymentSuccess', paymentRecord).catch(console.error);
    } else {
      if (topicArn) await eventPublisher.publish(topicArn, 'PaymentFailed', paymentRecord).catch(console.error);
      const error = new Error('Payment declined by the gateway');
      error.statusCode = 400;
      error.paymentId = paymentRecord.id;
      throw error;
    }

    return paymentRecord;
  }

  async getPaymentHistoryByOrderId(orderId) {
    return await paymentRepository.getPaymentsByOrderId(orderId);
  }

  async getPaymentHistoryByUser(userId) {
    return await paymentRepository.getPaymentsByUser(userId);
  }

  async getAllPayments() {
    return await paymentRepository.getAllPayments();
  }
}

module.exports = new PaymentService();
