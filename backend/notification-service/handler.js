const notificationService = require('./services/notification.service');
const logger = require('./utils/logger');

exports.processNotificationEvents = async (event) => {
  logger.info('Received SQS Event', { event });

  for (const record of event.Records) {
    try {
      const snsMessage = JSON.parse(record.body);
      
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

      const { eventType, payload } = message;

      if (eventType === 'PaymentSuccess' || eventType === 'PaymentFailed') {
        const { orderId, amount, status } = payload;
        
        await notificationService.processPaymentEvent(
          orderId, 
          amount, 
          eventType === 'PaymentSuccess' ? 'SUCCESS' : 'FAILED'
        );
      }
    } catch (error) {
      logger.error('Error processing SQS record', error);
      throw error; 
    }
  }

  return { statusCode: 200, body: 'Success' };
};
