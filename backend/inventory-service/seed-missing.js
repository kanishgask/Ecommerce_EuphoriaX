const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({ region: 'ap-southeast-1' });
const ddbDocClient = DynamoDBDocumentClient.from(client);

const MISSING_PRODUCTS = [
  { productId: '93e208d3-466b-4560-8634-1143c2e28b9c', name: 'Silk Scarf' },
  { productId: 'a4286325-dfea-4733-b3f4-a83001cb23d8', name: 'Mechanical Keyboard' },
  { productId: 'f5ab3f34-a02f-4656-a8c1-e82f59c5eb1f', name: 'Vintage Denim Jacket' },
  { productId: 'd1a1027b-93c5-43e4-911d-703d9e5bf81c', name: 'Smart Fitness Ring' },
  { productId: '4616e0fa-64d0-4ace-aea4-199a65ea753b', name: 'Noise-Cancelling Earbuds' },
  { productId: '30732eef-8312-41a6-ba5c-98986fd3f555', name: 'Luxury Leather Wallet' },
  { productId: '5059e491-911a-4eaf-b22c-f451c847e43f', name: 'Classic Sunglasses' },
  { productId: '46e160dd-693e-48fd-b320-c198e164bf83', name: 'Smart Speaker' },
  { productId: '80ac090a-7f5d-492c-9272-362ccb2532f6', name: 'Travel Backpack' },
];

async function seed() {
  console.log('Seeding missing products into K_Inventory...');
  for (const product of MISSING_PRODUCTS) {
    try {
      await ddbDocClient.send(new PutCommand({
        TableName: 'K_Inventory',
        Item: {
          productId: product.productId,
          availableStock: 100,
          reservedStock: 0,
          updatedAt: new Date().toISOString()
        }
      }));
      console.log(`✅ Seeded: ${product.name}`);
    } catch (err) {
      console.error(`❌ Failed: ${product.name}`, err.message);
    }
  }
  console.log('Done!');
}

seed();
