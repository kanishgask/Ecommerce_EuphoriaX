const inventoryService = require('./services/inventory.service');

exports.processInventoryEvents = async (event) => {
  console.log('Received SQS Event:', JSON.stringify(event, null, 2));

  for (const record of event.Records) {
    try {
      const snsMessage = JSON.parse(record.body);
      const message = JSON.parse(snsMessage.Message);
      const { eventType, payload } = message;

      if (eventType === 'OrderCreated') {
        const { id, items } = payload;
        await inventoryService.reserveInventory(id, items);
        console.log(`Inventory reservation processed for Order ${id}`);
      }
    } catch (error) {
      console.error('Error processing SQS record', error);
      throw error; // Trigger DLQ retry
    }
  }

  return { statusCode: 200, body: 'Success' };
};
