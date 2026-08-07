require('dotenv').config();

module.exports = {
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 3006,
  aws: {
    region: process.env.AWS_REGION || 'us-east-1',
    dynamodb: {
      paymentsTable: process.env.DYNAMODB_PAYMENTS_TABLE || 'Payments',
    }
  }
};
