const { GetCommand, PutCommand, UpdateCommand, DeleteCommand, QueryCommand, ScanCommand } = require('@aws-sdk/lib-dynamodb');
const ddb = require('../utils/dynamoClient');

const TABLE = process.env.PRODUCTS_TABLE_NAME;

async function getById(productId) {
  const { Item } = await ddb.send(new GetCommand({ TableName: TABLE, Key: { productId } }));
  return Item || null;
}

async function getBySlug(slug) {
  const { Items } = await ddb.send(new QueryCommand({
    TableName: TABLE,
    IndexName: 'SlugIndex',
    KeyConditionExpression: 'slug = :slug',
    ExpressionAttributeValues: { ':slug': slug },
    Limit: 1
  }));
  return (Items && Items[0]) || null;
}

async function create(product) {
  await ddb.send(new PutCommand({ TableName: TABLE, Item: product, ConditionExpression: 'attribute_not_exists(productId)' }));
  return product;
}

async function update(productId, patch, expectedVersion) {
  const now = new Date().toISOString();
  const names = { '#updatedAt': 'updatedAt', '#version': 'version' };
  const values = { ':updatedAt': now, ':inc': 1, ':expectedVersion': expectedVersion };
  const sets = ['#updatedAt = :updatedAt', '#version = #version + :inc'];

  Object.entries(patch).forEach(([key, value], idx) => {
    const n = `#f${idx}`, v = `:v${idx}`;
    names[n] = key; values[v] = value;
    sets.push(`${n} = ${v}`);
  });

  const { Attributes } = await ddb.send(new UpdateCommand({
    TableName: TABLE,
    Key: { productId },
    UpdateExpression: `SET ${sets.join(', ')}`,
    ConditionExpression: '#version = :expectedVersion',
    ExpressionAttributeNames: names,
    ExpressionAttributeValues: values,
    ReturnValues: 'ALL_NEW'
  }));
  return Attributes;
}

async function remove(productId) {
  await ddb.send(new DeleteCommand({ TableName: TABLE, Key: { productId } }));
  return true;
}

async function listByCategory(category, { limit = 20, cursor } = {}) {
  const { Items, LastEvaluatedKey } = await ddb.send(new QueryCommand({
    TableName: TABLE,
    IndexName: 'CategoryIndex',
    KeyConditionExpression: 'category = :category',
    ExpressionAttributeValues: { ':category': category },
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

// Simple in-service keyword search over name/description (case-insensitive contains).
// For production-scale search, the dedicated Search service consumes ProductCreated/
// ProductUpdated events (published below) into a denormalized, query-optimized index.
async function searchByKeyword(keyword, { limit = 50 } = {}) {
  const { Items } = await ddb.send(new ScanCommand({ TableName: TABLE, Limit: limit }));
  const needle = keyword.toLowerCase();
  return (Items || []).filter(
    (p) => p.name?.toLowerCase().includes(needle) || p.description?.toLowerCase().includes(needle)
  );
}

module.exports = { getById, getBySlug, create, update, remove, listByCategory, listAll, searchByKeyword };
