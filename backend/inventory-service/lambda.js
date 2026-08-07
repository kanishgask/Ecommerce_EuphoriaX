const serverless = require('serverless-http');
const app = require('./app');

// This is the entry point API Gateway will invoke
module.exports.apiHandler = serverless(app);
