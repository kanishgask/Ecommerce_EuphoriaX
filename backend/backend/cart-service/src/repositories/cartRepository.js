const { GetCommand, PutCommand, UpdateCommand, DeleteCommand, QueryCommand, BatchWriteCommand } = require('@aws-sdk/lib-dynamodb');
const ddb = require('../utils/dynamoClient');

const TABLE = process.env.CART_TABLE_NAME;

async function getItem(userId, productId) {
  const { Item } = await ddb.send(new GetCommand({ TableName: TABLE, Key: { userId, productId } }));
  return Item || null;
}

async function getCart(userId) {
  const { Items } = await ddb.send(new QueryCommand({
    TableName: TABLE,
    KeyConditionExpression: 'userId = :userId',
    ExpressionAttributeValues: { ':userId': userId }
  }));
  return Items || [];
}

async function putItem(item) {
  await ddb.send(new PutCommand({ TableName: TABLE, Item: item }));
  return item;
}

async function updateQuantity(userId, productId, quantity) {
  const now = new Date().toISOString();
  const { Attributes } = await ddb.send(new UpdateCommand({
    TableName: TABLE,
    Key: { userId, productId },
    UpdateExpression: 'SET quantity = :q, updatedAt = :u',
    ConditionExpression: 'attribute_exists(productId)',
    ExpressionAttributeValues: { ':q': quantity, ':u': now },
    ReturnValues: 'ALL_NEW'
  }));
  return Attributes;
}

async function removeItem(userId, productId) {
  await ddb.send(new DeleteCommand({ TableName: TABLE, Key: { userId, productId } }));
  return true;
}

async function clearCart(userId) {
  const items = await getCart(userId);
  if (items.length === 0) return true;

  const chunks = [];
  for (let i = 0; i < items.length; i += 25) chunks.push(items.slice(i, i + 25));

  for (const chunk of chunks) {
    await ddb.send(new BatchWriteCommand({
      RequestItems: {
        [TABLE]: chunk.map((it) => ({ DeleteRequest: { Key: { userId: it.userId, productId: it.productId } } }))
      }
    }));
  }
  return true;
}

module.exports = { getItem, getCart, putItem, updateQuantity, removeItem, clearCart };
