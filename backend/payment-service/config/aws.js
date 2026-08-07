const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient } = require('@aws-sdk/lib-dynamodb');
const config = require('./config');

const dynamoDbClient = new DynamoDBClient({ region: config.aws.region });
const ddbDocClient = DynamoDBDocumentClient.from(dynamoDbClient, {
  marshallOptions: { removeUndefinedValues: true }
});

module.exports = {
  ddbDocClient
};
