const { GetCommand, PutCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');
const ddb = require('../utils/dynamoClient');

const TABLE = process.env.INVENTORY_TABLE_NAME;

async function getByProductId(productId) {
  const { Item } = await ddb.send(new GetCommand({ TableName: TABLE, Key: { productId } }));
  return Item || null;
}

async function create(inventory) {
  await ddb.send(new PutCommand({ TableName: TABLE, Item: inventory, ConditionExpression: 'attribute_not_exists(productId)' }));
  return inventory;
}

async function updateStock(productId, newStock, historyEntry, expectedVersion) {
  const now = new Date().toISOString();
  const { Attributes } = await ddb.send(new UpdateCommand({
    TableName: TABLE,
    Key: { productId },
    UpdateExpression: 'SET stock = :stock, updatedAt = :updatedAt, #version = #version + :inc, history = list_append(if_not_exists(history, :emptyList), :historyEntry)',
    ConditionExpression: '#version = :expectedVersion',
    ExpressionAttributeNames: { '#version': 'version' },
    ExpressionAttributeValues: {
      ':stock': newStock,
      ':updatedAt': now,
      ':inc': 1,
      ':expectedVersion': expectedVersion,
      ':emptyList': [],
      ':historyEntry': [historyEntry]
    },
    ReturnValues: 'ALL_NEW'
  }));
  return Attributes;
}

module.exports = { getByProductId, create, updateStock };