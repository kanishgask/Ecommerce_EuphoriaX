const { GetCommand, PutCommand, UpdateCommand, QueryCommand, ScanCommand } = require('@aws-sdk/lib-dynamodb');
const ddb = require('../utils/dynamoClient');

const TABLE = process.env.ORDERS_TABLE_NAME;

async function getById(orderId) {
  const { Item } = await ddb.send(new GetCommand({ TableName: TABLE, Key: { orderId } }));
  return Item || null;
}

async function create(order) {
  await ddb.send(new PutCommand({ TableName: TABLE, Item: order, ConditionExpression: 'attribute_not_exists(orderId)' }));
  return order;
}

async function updateStatus(orderId, newStatus, expectedVersion) {
  const now = new Date().toISOString();
  const { Attributes } = await ddb.send(new UpdateCommand({
    TableName: TABLE,
    Key: { orderId },
    UpdateExpression: 'SET #status = :status, updatedAt = :now, statusHistory = list_append(statusHistory, :entry), version = version + :inc',
    ConditionExpression: 'version = :expectedVersion',
    ExpressionAttributeNames: { '#status': 'status' },
    ExpressionAttributeValues: {
      ':status': newStatus,
      ':now': now,
      ':entry': [{ status: newStatus, at: now }],
      ':inc': 1,
      ':expectedVersion': expectedVersion
    },
    ReturnValues: 'ALL_NEW'
  }));
  return Attributes;
}

async function listByUser(userId, { limit = 20, cursor } = {}) {
  const { Items, LastEvaluatedKey } = await ddb.send(new QueryCommand({
    TableName: TABLE,
    IndexName: 'UserOrdersIndex',
    KeyConditionExpression: 'userId = :userId',
    ExpressionAttributeValues: { ':userId': userId },
    Limit: limit,
    ScanIndexForward: false,
    ExclusiveStartKey: cursor ? JSON.parse(Buffer.from(cursor, 'base64').toString()) : undefined
  }));
  return {
    items: Items || [],
    nextCursor: LastEvaluatedKey ? Buffer.from(JSON.stringify(LastEvaluatedKey)).toString('base64') : null
  };
}

async function listAll({ limit = 20, cursor } = {}) {
  const { Items, LastEvaluatedKey } = await ddb.send(new ScanCommand({
    TableName: TABLE,
    Limit: limit,
    ExclusiveStartKey: cursor ? JSON.parse(Buffer.from(cursor, 'base64').toString()) : undefined
  }));
  return {
    items: Items || [],
    nextCursor: LastEvaluatedKey ? Buffer.from(JSON.stringify(LastEvaluatedKey)).toString('base64') : null
  };
}

module.exports = { getById, create, updateStatus, listByUser, listAll };
