const { PutCommand } = require('@aws-sdk/lib-dynamodb');
const { ddbDocClient } = require('./config/aws');
const config = require('./config/config');

// These IDs match exactly what is in your product-service/seed.js!
const PRODUCT_IDS = [
  '3bb89cc7-fe95-453c-a64f-2c43b23ec124', // Aviator Sunglasses
  '93e208d3-466b-4560-8634-1143c2e28b9c', // Silk Scarf
  'b57f72b3-38fa-4319-b186-1aee897e0f6e', // Classic Baseball Cap
  '83058328-eeef-4c97-be53-e581faf9bf59', // Minimalist Watch
  'c48ff070-4e2a-4216-b2d9-bf89bad29114', // Leather Tote
  '0333da9e-e179-4002-adc3-0671aa09f628', // Premium Wireless Headphones
  'ab06c984-5459-433b-9f55-a503a204ed5d', // Classic White Sneakers
  'a4286325-dfea-4733-b3f4-a83001cb23d8', // Mechanical Keyboard
  'f5ab3f34-a02f-4656-a8c1-e82f59c5eb1f', // Vintage Denim Jacket
  'd1a1027b-93c5-43e4-911d-703d9e5bf81c', // Smart Fitness Ring
  '4616e0fa-64d0-4ace-aea4-199a65ea753b', // Noise-Cancelling Earbuds
  '30732eef-8312-41a6-ba5c-98986fd3f555', // Luxury Leather Wallet
  '308da2ad-e587-4cb7-a5f9-0ed27158cc93', // Polaroid Instant Camera
  'c3ff7f4e-05f0-46b8-96ab-baa196083e03', // Oversized Cotton Hoodie
  '06e22fee-253d-4896-ba2a-8bbd72b0cd13', // Gaming Mouse Pro
  'c6aebab0-ee45-42c4-979d-0f9b5dbe4b41', // Running Shoes
  '5059e491-911a-4eaf-b22c-f451c847e43f', // Classic Sunglasses
  '46e160dd-693e-48fd-b320-c198e164bf83', // Smart Speaker App
  'c90cb532-aae5-4d09-8af2-94e4425395de', // Leather Chelsea Boots
  '80ac090a-7f5d-492c-9272-362ccb2532f6', // Travel Backpack
];

async function seedInventory() {
  console.log(`Starting to seed DynamoDB Table: K_Inventory...`);
  for (const productId of PRODUCT_IDS) {
    const params = {
      TableName: 'K_Inventory',
      Item: {
        productId: productId,
        availableStock: 100, // Give everything 100 stock!
        reservedStock: 0,
        updatedAt: new Date().toISOString()
      }
    };
    try {
      await ddbDocClient.send(new PutCommand(params));
      console.log(`Successfully added 100 stock for product: ${productId}`);
    } catch (error) {
      console.error(`Failed to add stock for product: ${productId}`, error);
    }
  }
  console.log('Seeding completed! You are ready to sell!');
}

seedInventory();
