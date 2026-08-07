const paymentService = require('./services/payment.service');

exports.processPaymentEvents = async (event) => {
  console.log('Received SQS Event:', JSON.stringify(event, null, 2));

  for (const record of event.Records) {
    try {
      const snsMessage = JSON.parse(record.body);
      const message = JSON.parse(snsMessage.Message);
      const { eventType, payload } = message;

      if (eventType === 'InventoryReserved') {
        const { orderId } = payload;
        
        // Mocking payment details for the async flow. 
        // In a real app, this might pull saved card details from a secure vault.
        const mockPaymentData = {
          orderId,
          userId: 'system-async', // Or derived from order
          amount: 100, // In reality, we'd fetch the order total
          paymentMethod: {
            cardNumber: '1234567812345678',
            expiry: '12/26',
            cvv: '123'
          }
        };

        try {
          await paymentService.processPayment(mockPaymentData);
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
