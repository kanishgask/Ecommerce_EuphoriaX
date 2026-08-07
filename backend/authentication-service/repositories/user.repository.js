const { PutCommand, GetCommand } = require('@aws-sdk/lib-dynamodb');
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
}

module.exports = new UserRepository();
