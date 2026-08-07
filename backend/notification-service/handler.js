const notificationService = require('./services/notification.service');

exports.processNotificationEvents = async (event) => {
  console.log('Received SQS Event:', JSON.stringify(event, null, 2));

  for (const record of event.Records) {
    try {
      const snsMessage = JSON.parse(record.body);
      const message = JSON.parse(snsMessage.Message);
      const { eventType, payload } = message;

      if (eventType === 'PaymentSuccess' || eventType === 'PaymentFailed') {
        const { orderId, amount, status } = payload;
        
        // In a real system, we might look up the user's email from the User service via an internal API
        // or the order payload might contain the email. For demonstration:
        const notificationData = {
          email: 'customer@example.com', // Mocked or extracted
          orderId,
          amount,
          status: eventType === 'PaymentSuccess' ? 'SUCCESS' : 'FAILED',
          userName: 'Valued Customer'
        };

        await notificationService.sendPaymentConfirmation(notificationData);
        console.log(`Payment notification sent for Order ${orderId}`);
      }
    } catch (error) {
      console.error('Error processing SQS record', error);
      throw error; 
    }
  }

  return { statusCode: 200, body: 'Success' };
};
