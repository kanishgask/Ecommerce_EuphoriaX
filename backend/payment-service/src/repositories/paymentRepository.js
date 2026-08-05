const { GetCommand, PutCommand, UpdateCommand, QueryCommand } = require('@aws-sdk/lib-dynamodb');
const ddb = require('../utils/dynamoClient');
const TABLE = process.env.PAYMENT_TABLE_NAME;

async function getById(paymentId) {
  const { Item } = await ddb.send(new GetCommand({ TableName: TABLE, Key: { paymentId } }));
  return Item || null;
}

async function create(payment) {
  await ddb.send(new PutCommand({ TableName: TABLE, Item: payment, ConditionExpression: 'attribute_not_exists(paymentId)' }));
  return payment;
}

async function updateStatus(paymentId, status, transactionId, expectedVersion) {
  const now = new Date().toISOString();
  const { Attributes } = await ddb.send(new UpdateCommand({
    TableName: TABLE,
    Key: { paymentId },
    UpdateExpression: 'SET #status = :status, transactionId = :transactionId, updatedAt = :updatedAt, #version = #version + :inc',
    ConditionExpression: '#version = :expectedVersion',
    ExpressionAttributeNames: { '#version': 'version', '#status': 'status' },
    ExpressionAttributeValues: {
      ':status': status,
      ':transactionId': transactionId,
      ':updatedAt': now,
      ':inc': 1,
      ':expectedVersion': expectedVersion
    },
    ReturnValues: 'ALL_NEW'
  }));
  return Attributes;
}

async function listByUserId(userId) {
  // requires a GSI on userId
  const { Items } = await ddb.send(new QueryCommand({
    TableName: TABLE,
    IndexName: 'UserIdIndex',
    KeyConditionExpression: 'userId = :userId',
    ExpressionAttributeValues: { ':userId': userId }
  }));
  return Items || [];
}

module.exports = { getById, create, updateStatus, listByUserId };