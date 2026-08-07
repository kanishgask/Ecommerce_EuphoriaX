require('dotenv').config();

module.exports = {
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 3004,
  aws: {
    region: process.env.AWS_REGION || 'us-east-1',
    dynamodb: {
      inventoryTable: process.env.DYNAMODB_INVENTORY_TABLE || 'Inventory',
    }
  }
};
