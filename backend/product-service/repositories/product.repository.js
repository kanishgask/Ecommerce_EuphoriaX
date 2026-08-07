const { PutCommand, GetCommand, UpdateCommand, DeleteCommand, ScanCommand } = require('@aws-sdk/lib-dynamodb');
const { ddbDocClient } = require('../config/aws');
const config = require('../config/config');

class ProductRepository {
  async createProduct(product) {
    const params = {
      TableName: config.aws.dynamodb.productsTable,
      Item: product
    };
    await ddbDocClient.send(new PutCommand(params));
    return product;
  }

  async getProductById(id) {
    const params = {
      TableName: config.aws.dynamodb.productsTable,
      Key: { id }
    };
    const { Item } = await ddbDocClient.send(new GetCommand(params));
    return Item;
  }

  async updateProduct(id, updates) {
    let updateExpression = 'set ';
    const expressionAttributeValues = {};
    const expressionAttributeNames = {};

    Object.keys(updates).forEach((key, index) => {
      // #key is used to avoid reserved keyword conflicts
      updateExpression += `#${key} = :v${index}, `;
      expressionAttributeNames[`#${key}`] = key;
      expressionAttributeValues[`:v${index}`] = updates[key];
    });

    updateExpression = updateExpression.slice(0, -2); // Remove trailing comma and space
    updateExpression += ', #updatedAt = :updatedAt';
    expressionAttributeNames['#updatedAt'] = 'updatedAt';
    expressionAttributeValues[':updatedAt'] = new Date().toISOString();

    const params = {
      TableName: config.aws.dynamodb.productsTable,
      Key: { id },
      UpdateExpression: updateExpression,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW'
    };

    const { Attributes } = await ddbDocClient.send(new UpdateCommand(params));
    return Attributes;
  }

  async deleteProduct(id) {
    const params = {
      TableName: config.aws.dynamodb.productsTable,
      Key: { id }
    };
    await ddbDocClient.send(new DeleteCommand(params));
  }

  async getAllProducts(filters = {}) {
    // Note: In production, use Query or secondary indexes for performance. 
    // Scan is acceptable here for prototype/demonstration.
    const params = {
      TableName: config.aws.dynamodb.productsTable,
    };

    if (filters.category) {
      params.FilterExpression = '#category = :category';
      params.ExpressionAttributeNames = { '#category': 'category' };
      params.ExpressionAttributeValues = { ':category': filters.category };
    }

    const { Items } = await ddbDocClient.send(new ScanCommand(params));
    return Items || [];
  }
}

module.exports = new ProductRepository();
