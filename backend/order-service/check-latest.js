const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({ region: 'ap-southeast-1' });
const ddbDocClient = DynamoDBDocumentClient.from(client);

async function check() {
  // Check the most recent order
  const orderId = '2a52664b-71e5-45b6-86cc-4d0f87cf257e';
  const { Item: order } = await ddbDocClient.send(new GetCommand({
    TableName: 'K_Orders',
    Key: { id: orderId }
  }));
  console.log('Latest order:', JSON.stringify(order, null, 2));

  // Check if K_Payments has any entries for this order
  const { DynamoDBDocumentClient: DDC, ScanCommand } = require('@aws-sdk/lib-dynamodb');
  const { Items: payments } = await ddbDocClient.send(new ScanCommand({
    TableName: 'K_Payments',
    FilterExpression: 'orderId = :oid',
    ExpressionAttributeValues: { ':oid': orderId }
  }));
  console.log('\nPayments for this order:', JSON.stringify(payments, null, 2));
}

check().catch(console.error);
