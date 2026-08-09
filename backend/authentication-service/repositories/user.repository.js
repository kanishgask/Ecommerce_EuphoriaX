const { PutCommand, GetCommand, ScanCommand } = require('@aws-sdk/lib-dynamodb');
const { ddbDocClient } = require('../config/aws');
const config = require('../config/config');

class UserRepository {
  async createUser(user) {
    const params = {
      TableName: config.aws.dynamodb.usersTable,
      Item: {
        id: user.id, // Cognito sub (user ID)
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        createdAt: new Date().toISOString()
      }
    };
    await ddbDocClient.send(new PutCommand(params));
    return params.Item;
  }

  async getUserById(id) {
    const params = {
      TableName: config.aws.dynamodb.usersTable,
      Key: {
        id: id
      }
    };
    const { Item } = await ddbDocClient.send(new GetCommand(params));
    return Item;
  }

  async getAllUsers() {
    const params = {
      TableName: config.aws.dynamodb.usersTable
    };
    try {
      const { Items } = await ddbDocClient.send(new ScanCommand(params));
      return Items || [];
    } catch (e) {
      console.error("Error scanning users:", e);
      return [];
    }
  }
}

module.exports = new UserRepository();
