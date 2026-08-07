const { GetCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');
const { ddbDocClient } = require('../config/aws');
const config = require('../config/config');

class InventoryRepository {
  async getInventory(productId) {
    const params = {
      TableName: config.aws.dynamodb.inventoryTable,
      Key: { productId }
    };
    const { Item } = await ddbDocClient.send(new GetCommand(params));
    return Item || { productId, availableStock: 0, reservedStock: 0 };
  }

  async updateStock(productId, availableStock) {
    const params = {
      TableName: config.aws.dynamodb.inventoryTable,
      Key: { productId },
      UpdateExpression: 'set availableStock = :availableStock, updatedAt = :updatedAt',
      ExpressionAttributeValues: {
        ':availableStock': availableStock,
        ':updatedAt': new Date().toISOString()
      },
      ReturnValues: 'ALL_NEW'
    };
    const { Attributes } = await ddbDocClient.send(new UpdateCommand(params));
    return Attributes;
  }

  // Uses optimistic locking/conditional expressions to ensure stock doesn't go negative
  async reserveStock(productId, quantity) {
    const params = {
      TableName: config.aws.dynamodb.inventoryTable,
      Key: { productId },
      UpdateExpression: 'set availableStock = availableStock - :q, reservedStock = reservedStock + :q, updatedAt = :updatedAt',
      ConditionExpression: 'availableStock >= :q',
      ExpressionAttributeValues: {
        ':q': quantity,
        ':updatedAt': new Date().toISOString()
      },
      ReturnValues: 'ALL_NEW'
    };
    const { Attributes } = await ddbDocClient.send(new UpdateCommand(params));
    return Attributes;
  }

  async releaseStock(productId, quantity) {
    const params = {
      TableName: config.aws.dynamodb.inventoryTable,
      Key: { productId },
      UpdateExpression: 'set availableStock = availableStock + :q, reservedStock = reservedStock - :q, updatedAt = :updatedAt',
      ConditionExpression: 'reservedStock >= :q',
      ExpressionAttributeValues: {
        ':q': quantity,
        ':updatedAt': new Date().toISOString()
      },
      ReturnValues: 'ALL_NEW'
    };
    const { Attributes } = await ddbDocClient.send(new UpdateCommand(params));
    return Attributes;
  }
}

module.exports = new InventoryRepository();
