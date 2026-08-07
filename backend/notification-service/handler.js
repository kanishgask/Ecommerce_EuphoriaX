const notificationService = require('./services/notification.service');
const logger = require('./utils/logger');

exports.processNotificationEvents = async (event) => {
  logger.info('Received SQS Event', { event });

  for (const record of event.Records) {
    try {
      const snsMessage = JSON.parse(record.body);
      
      let message;
      try {
        message = JSON.parse(snsMessage.Message);
      } catch (err) {
        logger.error('Failed to parse snsMessage.Message. Ensure Raw Message Delivery is OFF', { error: err.message, body: snsMessage.Message });
        continue;
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
