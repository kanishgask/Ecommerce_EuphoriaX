const { GetCommand, PutCommand, UpdateCommand, QueryCommand, DeleteCommand } = require('@aws-sdk/lib-dynamodb');
const ddb = require('../utils/dynamoClient');
const TABLE = process.env.NOTIFICATION_TABLE_NAME;

async function create(notification) {
  await ddb.send(new PutCommand({ TableName: TABLE, Item: notification }));
  return notification;
}

async function getByUserId(userId) {
  // Requires GSI on userId
  const { Items } = await ddb.send(new QueryCommand({
    TableName: TABLE,
    IndexName: 'UserIdIndex',
    KeyConditionExpression: 'userId = :userId',
    ExpressionAttributeValues: { ':userId': userId },
    ScanIndexForward: false // newest first
  }));
  return Items || [];
}

async function markAsRead(notificationId) {
  const { Attributes } = await ddb.send(new UpdateCommand({
    TableName: TABLE,
    Key: { notificationId },
    UpdateExpression: 'SET #read = :r',
    ExpressionAttributeNames: { '#read': 'read' },
    ExpressionAttributeValues: { ':r': true },
    ReturnValues: 'ALL_NEW'
  }));
  return Attributes;
}

async function deleteNotification(notificationId) {
  await ddb.send(new DeleteCommand({ TableName: TABLE, Key: { notificationId } }));
  return true;
}

module.exports = { create, getByUserId, markAsRead, deleteNotification };