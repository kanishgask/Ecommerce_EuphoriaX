const { PutCommand, QueryCommand, ScanCommand } = require('@aws-sdk/lib-dynamodb');
const { ddbDocClient } = require('../config/aws');
const config = require('../config/config');

class PaymentRepository {
  async savePayment(payment) {
    const params = {
      TableName: config.aws.dynamodb.paymentsTable,
      Item: payment
    };
    await ddbDocClient.send(new PutCommand(params));
    return payment;
  }

  async getPaymentsByOrderId(orderId) {
    const params = {
      TableName: config.aws.dynamodb.paymentsTable,
      IndexName: 'OrderIdIndex',
      KeyConditionExpression: 'orderId = :orderId',
      ExpressionAttributeValues: {
        ':orderId': orderId
      }
    };
    try {
      const { Items } = await ddbDocClient.send(new QueryCommand(params));
      return Items || [];
    } catch (e) {
      console.warn("Index query failed for OrderIdIndex: ", e.message);
      return [];
    }
  }

  async getPaymentsByUser(userId) {
    const params = {
      TableName: config.aws.dynamodb.paymentsTable,
      IndexName: 'UserIdIndex',
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      }
    };
    try {
      const { Items } = await ddbDocClient.send(new QueryCommand(params));
      return Items || [];
    } catch (e) {
      console.warn("Index query failed for UserIdIndex: ", e.message);
      return [];
    }
  }

  async getAllPayments() {
    const params = {
      TableName: config.aws.dynamodb.paymentsTable
    };
    try {
      const { Items } = await ddbDocClient.send(new ScanCommand(params));
      return Items || [];
    } catch (e) {
      console.error("Error scanning payments:", e);
      return [];
    }
  }
}

module.exports = new PaymentRepository();
