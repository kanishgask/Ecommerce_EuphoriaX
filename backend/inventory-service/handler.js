const inventoryService = require('./services/inventory.service');

exports.processInventoryEvents = async (event) => {
  console.log('Received SQS Event:', JSON.stringify(event, null, 2));

  for (const record of event.Records) {
    try {
      const snsMessage = JSON.parse(record.body);
      const message = JSON.parse(snsMessage.Message);
      const { eventType, payload } = message;

      if (eventType === 'OrderCreated') {
        const { id, items, userId, totalAmount } = payload;
        await inventoryService.reserveInventory(id, items, userId, totalAmount);
        console.log(`Inventory reservation processed for Order ${id}`);
      }
    } catch (error) {
      console.error('Error processing SQS record', error);
      // We log the error but DO NOT throw it. 
      // Throwing it keeps the poison message in the queue forever, causing infinite retries.
    }
  }

  return { statusCode: 200, body: 'Success' };
};
