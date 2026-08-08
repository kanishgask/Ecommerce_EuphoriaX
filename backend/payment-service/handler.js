const paymentService = require('./services/payment.service');

exports.processPaymentEvents = async (event) => {
  console.log('Received SQS Event:', JSON.stringify(event, null, 2));

  for (const record of event.Records) {
    try {
      let snsMessage;
      try {
        snsMessage = typeof record.body === 'string' ? JSON.parse(record.body) : record.body;
      } catch (err) {
        console.error('Failed to parse record.body. Deleting poison message.', err.message, record.body);
        continue;
      }

      let message;
      // Handle both SNS Envelope and RawMessageDelivery
      if (snsMessage.Message) {
        try {
          message = JSON.parse(snsMessage.Message);
        } catch (e) {
          message = snsMessage.Message; // Already an object?
        }
      } else {
        message = snsMessage; // Raw delivery
      }
      
      const { eventType, payload } = message || {};

      if (eventType === 'InventoryReserved') {
        const { orderId, userId, totalAmount } = payload;
        
        // Use real values passed from InventoryService
        const paymentData = {
          orderId,
          userId: userId || 'system-async', // Fallback just in case
          amount: totalAmount || 100,
          paymentMethod: {
            cardNumber: '1234567812345678',
            expiry: '12/26',
            cvv: '123'
          }
        };

        try {
          await paymentService.processPayment(paymentData);
          console.log(`Payment processed for Order ${orderId}`);
        } catch (err) {
          console.error(`Payment failed for Order ${orderId}: ${err.message}`);
        }
      }
    } catch (error) {
      console.error('Error processing SQS record', error);
      throw error; 
    }
  }

  return { statusCode: 200, body: 'Success' };
};
