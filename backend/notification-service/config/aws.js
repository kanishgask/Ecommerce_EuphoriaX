const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient } = require('@aws-sdk/lib-dynamodb');
const AWSXRay = require('aws-xray-sdk-core');

// Create standard client
const client = new DynamoDBClient({
  region: process.env.AWS_REGION || 'ap-southeast-1'
});

// Wrap the v3 client with X-Ray if running in Lambda
const ddbClient = process.env.AWS_XRAY_DAEMON_ADDRESS ? AWSXRay.captureAWSv3Client(client) : client;

const marshallOptions = {
  convertEmptyValues: false,
  removeUndefinedValues: true,
  convertClassInstanceToMap: false,
};

const unmarshallOptions = {
  wrapNumbers: false,
};

const ddbDocClient = DynamoDBDocumentClient.from(ddbClient, {
  marshallOptions,
  unmarshallOptions,
});

module.exports = { ddbDocClient };
