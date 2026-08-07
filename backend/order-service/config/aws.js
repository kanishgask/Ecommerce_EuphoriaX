const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient } = require('@aws-sdk/lib-dynamodb');
const AWSXRay = require('aws-xray-sdk-core');
const config = require('./config');

const dynamoDbClient = AWSXRay.captureAWSv3Client(new DynamoDBClient({ region: config.aws.region }));
const ddbDocClient = DynamoDBDocumentClient.from(dynamoDbClient, {
  marshallOptions: { removeUndefinedValues: true }
});

module.exports = {
  ddbDocClient
};
