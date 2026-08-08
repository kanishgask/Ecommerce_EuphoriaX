const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, ScanCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({ region: 'ap-southeast-1' });
const ddbDocClient = DynamoDBDocumentClient.from(client);

async function check() {
  // Get latest 5 orders
  const { Items } = await ddbDocClient.send(new ScanCommand({
    TableName: 'K_Orders',
    FilterExpression: '#s = :pending',
    ExpressionAttributeNames: { '#s': 'status' },
    ExpressionAttributeValues: { ':pending': 'PENDING' },
    Limit: 50
  }));

  const sorted = Items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);

  console.log(`Total PENDING orders: ${Items.length}`);
  console.log('\nLatest 5 PENDING orders:');
  for (const o of sorted) {
    console.log(`- Order ${o.id} | userId: ${o.userId} | amount: $${o.totalAmount} | created: ${o.createdAt} | items: ${o.items.map(i => i.productId).join(', ')}`);
  }

  // Also get CONFIRMED count
  const confirmed = await ddbDocClient.send(new ScanCommand({
    TableName: 'K_Orders',
    FilterExpression: '#s = :confirmed',
    ExpressionAttributeNames: { '#s': 'status' },
    ExpressionAttributeValues: { ':confirmed': 'CONFIRMED' },
    Select: 'COUNT'
  }));
  console.log(`\nTotal CONFIRMED orders: ${confirmed.Count}`);
}

check().catch(console.error);
