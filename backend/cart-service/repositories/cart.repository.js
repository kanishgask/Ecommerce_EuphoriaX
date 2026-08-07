const { GetCommand, PutCommand, DeleteCommand } = require('@aws-sdk/lib-dynamodb');
const { ddbDocClient } = require('../config/aws');
const config = require('../config/config');

class CartRepository {
  async getCart(userId) {
    const params = {
      TableName: config.aws.dynamodb.cartTable,
      Key: { userId }
    };
    const { Item } = await ddbDocClient.send(new GetCommand(params));
    return Item || { userId, items: [], updatedAt: new Date().toISOString() };
  }

  async saveCart(cart) {
    cart.updatedAt = new Date().toISOString();
    const params = {
      TableName: config.aws.dynamodb.cartTable,
      Item: cart
    };
    await ddbDocClient.send(new PutCommand(params));
    return cart;
  }

  async clearCart(userId) {
    const params = {
      TableName: config.aws.dynamodb.cartTable,
      Key: { userId }
    };
    await ddbDocClient.send(new DeleteCommand(params));
  }
}

module.exports = new CartRepository();
