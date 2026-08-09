const { PutCommand, GetCommand, UpdateCommand, QueryCommand, ScanCommand } = require('@aws-sdk/lib-dynamodb');
const { ddbDocClient } = require('../config/aws');
const config = require('../config/config');

class OrderRepository {
  async createOrder(order) {
    const params = {
      TableName: config.aws.dynamodb.ordersTable,
      Item: order
    };
    await ddbDocClient.send(new PutCommand(params));
    return order;
  }

  async getOrderById(orderId) {
    const params = {
      TableName: config.aws.dynamodb.ordersTable,
      Key: { id: orderId }
    };
    const { Item } = await ddbDocClient.send(new GetCommand(params));
    return Item;
  }

  async updateOrderStatus(orderId, status) {
    const params = {
      TableName: config.aws.dynamodb.ordersTable,
      Key: { id: orderId },
      UpdateExpression: 'set #status = :status, updatedAt = :updatedAt',
      ExpressionAttributeNames: {
        '#status': 'status'
      },
      ExpressionAttributeValues: {
        ':status': status,
        ':updatedAt': new Date().toISOString()
      },
      ReturnValues: 'ALL_NEW'
    };
    const { Attributes } = await ddbDocClient.send(new UpdateCommand(params));
    return Attributes;
  }

  async getOrdersByUser(userId) {
    // In production, an index on userId should be used for querying
    // Example assumes a GSI named UserIdIndex
    const params = {
      TableName: config.aws.dynamodb.ordersTable,
      IndexName: 'UserIdIndex', // Ensure Terraform creates this index
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      }
    };
    try {
      const { Items } = await ddbDocClient.send(new QueryCommand(params));
      return Items || [];
    } catch (e) {
      // Fallback if index is not created yet (for dev without TF applied fully)
      console.warn("Index query failed, falling back to empty array for now: ", e.message);
      return []; 
    }
  }

  async getAllOrders() {
    const params = {
      TableName: config.aws.dynamodb.ordersTable
    };
    try {
      const { Items } = await ddbDocClient.send(new ScanCommand(params));
      return Items || [];
    } catch (e) {
      console.error("Error scanning orders:", e);
      return [];
    }
  }
}

module.exports = new OrderRepository();
