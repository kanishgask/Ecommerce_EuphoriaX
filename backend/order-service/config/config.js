require('dotenv').config();

module.exports = {
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 3005,
  aws: {
    region: process.env.AWS_REGION || 'us-east-1',
    cognito: {
      userPoolId: process.env.COGNITO_USER_POOL_ID,
    },
    dynamodb: {
      ordersTable: process.env.DYNAMODB_ORDERS_TABLE || 'Orders',
    }
  }
};
