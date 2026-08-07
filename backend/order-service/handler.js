const orderService = require('./services/order.service');

exports.processOrderUpdates = async (event) => {
  console.log('Received SQS Event:', JSON.stringify(event, null, 2));

  for (const record of event.Records) {
    try {
      const snsMessage = JSON.parse(record.body);
      const message = JSON.parse(snsMessage.Message);
      const { eventType, payload } = message;

      if (eventType === 'PaymentSuccess') {
        await orderService.updateOrderStatus(payload.orderId, 'CONFIRMED');
        console.log(`Order ${payload.orderId} status updated to CONFIRMED`);
      } else if (eventType === 'PaymentFailed') {
        await orderService.updateOrderStatus(payload.orderId, 'CANCELLED');
        console.log(`Order ${payload.orderId} status updated to CANCELLED`);
      }
    } catch (error) {
      console.error('Error processing SQS record', error);
      throw error; // Let Lambda DLQ handle retries
    }
  }

  return { statusCode: 200, body: 'Success' };
};
