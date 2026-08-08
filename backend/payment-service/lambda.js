const serverless = require('serverless-http');
const app = require('./app');
const sqsHandler = require('./handler');

const expressHandler = serverless(app);

// This is a Universal Handler that can handle both API Gateway HTTP requests and SQS events!
module.exports.apiHandler = async (event, context) => {
  // If the event comes from SQS, route it to our custom SQS processor
  if (event.Records && event.Records.length > 0 && event.Records[0].eventSource === 'aws:sqs') {
    return await sqsHandler.processPaymentEvents(event);
  }
  
  // Otherwise, route it to the Express app
  return await expressHandler(event, context);
};
