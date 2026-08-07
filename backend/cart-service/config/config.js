require('dotenv').config();

module.exports = {
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 3003,
  aws: {
    region: process.env.AWS_REGION || 'us-east-1',
    cognito: {
      userPoolId: process.env.COGNITO_USER_POOL_ID,
    },
    dynamodb: {
      cartTable: process.env.DYNAMODB_CART_TABLE || 'Cart',
    }
  }
};
