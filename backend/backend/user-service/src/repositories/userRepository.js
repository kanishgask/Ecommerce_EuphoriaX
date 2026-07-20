const { GetCommand, PutCommand, UpdateCommand, DeleteCommand, ScanCommand, QueryCommand } = require('@aws-sdk/lib-dynamodb');
const ddb = require('../utils/dynamoClient');

const TABLE = process.env.USERS_TABLE_NAME;

async function getById(userId) {
  const { Item } = await ddb.send(new GetCommand({ TableName: TABLE, Key: { userId } }));
  return Item || null;
}

async function create(profile) {
  await ddb.send(new PutCommand({
    TableName: TABLE,
    Item: profile,
    ConditionExpression: 'attribute_not_exists(userId)'
  }));
  return profile;
}

async function upsertFromAuth(profile) {
  // Idempotent create used the first time a Cognito-authenticated user hits the service.
  await ddb.send(new PutCommand({
    TableName: TABLE,
    Item: profile,
    ConditionExpression: 'attribute_not_exists(userId)'
  })).catch((err) => {
    if (err.name !== 'ConditionalCheckFailedException') throw err;
  });
  return getById(profile.userId);
}

async function update(userId, patch, expectedVersion) {
  const now = new Date().toISOString();
  const names = { '#updatedAt': 'updatedAt', '#version': 'version' };
  const values = { ':updatedAt': now, ':inc': 1, ':expectedVersion': expectedVersion };
  const sets = ['#updatedAt = :updatedAt', '#version = #version + :inc'];

  Object.entries(patch).forEach(([key, value], idx) => {
    const nameKey = `#f${idx}`;
    const valueKey = `:v${idx}`;
    names[nameKey] = key;
    values[valueKey] = value;
    sets.push(`${nameKey} = ${valueKey}`);
  });

  const { Attributes } = await ddb.send(new UpdateCommand({
    TableName: TABLE,
    Key: { userId },
    UpdateExpression: `SET ${sets.join(', ')}`,
    ConditionExpression: '#version = :expectedVersion',
    ExpressionAttributeNames: names,
    ExpressionAttributeValues: values,
    ReturnValues: 'ALL_NEW'
  }));
  return Attributes;
}

async function remove(userId) {
  await ddb.send(new DeleteCommand({ TableName: TABLE, Key: { userId } }));
  return true;
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

module.exports = { getById, create, upsertFromAuth, update, remove, listAll };
