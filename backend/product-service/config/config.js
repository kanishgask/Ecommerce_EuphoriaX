require('dotenv').config();

module.exports = {
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 3002,
  aws: {
    region: process.env.AWS_REGION || 'us-east-1',
    dynamodb: {
      productsTable: process.env.DYNAMODB_PRODUCTS_TABLE || 'Products',
    }
  }
};
