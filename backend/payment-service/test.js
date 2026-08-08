const handler = require('./handler');

const mockEvent = {
  Records: [
    {
      body: JSON.stringify({
        Message: JSON.stringify({
          eventType: 'InventoryReserved',
          payload: {
            orderId: 'ORDER-123',
            userId: 'test-user',
            totalAmount: 100
          }
        })
      })
    }
  ]
};

async function run() {
  try {
    console.log('Running mock SQS event...');
    await handler.processPaymentEvents(mockEvent);
    console.log('Success!');
  } catch (error) {
    console.error('FAILED:', error);
  }
}

run();
