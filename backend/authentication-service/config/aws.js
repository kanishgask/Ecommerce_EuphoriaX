const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient } = require('@aws-sdk/lib-dynamodb');
const { CognitoIdentityProviderClient } = require('@aws-sdk/client-cognito-identity-provider');
const config = require('./config');

const dynamoDbClient = new DynamoDBClient({ region: config.aws.region });
const ddbDocClient = DynamoDBDocumentClient.from(dynamoDbClient, {
  marshallOptions: { removeUndefinedValues: true }
});

const cognitoClient = new CognitoIdentityProviderClient({ region: config.aws.region });

module.exports = {
  ddbDocClient,
  cognitoClient
};
