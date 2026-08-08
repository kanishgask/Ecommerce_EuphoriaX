const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand, ScanCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({ region: 'ap-southeast-1' });
const ddbDocClient = DynamoDBDocumentClient.from(client);

async function check() {
  console.log("Checking if products are in K_Inventory...");
  const { Items } = await ddbDocClient.send(new ScanCommand({ TableName: 'K_Inventory' }));
  console.log("Items in K_Inventory:", JSON.stringify(Items, null, 2));
}

check();
