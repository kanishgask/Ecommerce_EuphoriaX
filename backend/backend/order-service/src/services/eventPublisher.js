const { SNSClient, PublishCommand } = require('@aws-sdk/client-sns');
const logger = require('../utils/logger');

const sns = new SNSClient({ region: process.env.AWS_REGION });
const TOPIC_ARN = process.env.ORDER_EVENTS_TOPIC_ARN;

async function publishOrderEvent(eventType, order) {
  if (!TOPIC_ARN) {
    logger.warn('ORDER_EVENTS_TOPIC_ARN not set — skipping event publish', { eventType });
    return;
  }
  try {
    await sns.send(new PublishCommand({
      TopicArn: TOPIC_ARN,
      Message: JSON.stringify({ eventType, order, occurredAt: new Date().toISOString() }),
      MessageAttributes: {
        eventType: { DataType: 'String', StringValue: eventType }
      }
    }));
  } catch (err) {
    // Event delivery failures should not fail the primary write path.
    logger.error('Failed to publish order event', { eventType, error: err.message });
  }
}

module.exports = { publishOrderEvent };
