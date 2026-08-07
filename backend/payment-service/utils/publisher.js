const { SNSClient, PublishCommand } = require('@aws-sdk/client-sns');

const snsClient = new SNSClient({ region: process.env.AWS_REGION || 'us-east-1' });

class EventPublisher {
  async publish(topicArn, eventType, payload) {
    const params = {
      TopicArn: topicArn,
      Message: JSON.stringify({
        eventType,
        timestamp: new Date().toISOString(),
        payload
      }),
      MessageAttributes: {
        eventType: {
          DataType: 'String',
          StringValue: eventType
        }
      }
    };

    try {
      const result = await snsClient.send(new PublishCommand(params));
      console.log(`[EventPublisher] Published ${eventType} to ${topicArn}. MessageId: ${result.MessageId}`);
      return result;
    } catch (error) {
      console.error(`[EventPublisher] Failed to publish ${eventType} to ${topicArn}`, error);
      throw error;
    }
  }
}

module.exports = new EventPublisher();
