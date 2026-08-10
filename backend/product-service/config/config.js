require('dotenv').config();

module.exports = {
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 3002,
  aws: {
    region: process.env.AWS_REGION || 'ap-southeast-1',
    cognito: {
      userPoolId: process.env.COGNITO_USER_POOL_ID,
      clientId: process.env.COGNITO_CLIENT_ID,
    },
    dynamodb: {
      productsTable: process.env.DYNAMODB_PRODUCTS_TABLE || 'Products',
    }
  }
};

