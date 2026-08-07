const { GetCommand } = require('@aws-sdk/lib-dynamodb');
const { ddbDocClient } = require('../config/aws');
const emailUtil = require('../utils/email');
const logger = require('../utils/logger');

class NotificationService {
  async processPaymentEvent(orderId, amount, status) {
    try {
      // 1. Fetch Order from DynamoDB to get the userId and items
      const orderParams = {
        TableName: process.env.DYNAMODB_ORDERS_TABLE || 'K_Orders',
        Key: { id: orderId }
      };
      
      const { Item: order } = await ddbDocClient.send(new GetCommand(orderParams));
      
      if (!order) {
        logger.error(`Order ${orderId} not found in database. Cannot send email.`);
        return { success: false, message: 'Order not found' };
      }

      const { userId, totalAmount } = order;

      // 2. Fetch User from DynamoDB to get the email address
      const userParams = {
        TableName: process.env.DYNAMODB_USERS_TABLE || 'K_Users',
        Key: { id: userId }
      };

      const { Item: user } = await ddbDocClient.send(new GetCommand(userParams));

      if (!user || !user.email) {
        logger.error(`User ${userId} not found or has no email. Cannot send email.`);
        return { success: false, message: 'User or email not found' };
      }

      const { email, firstName } = user;

      // 3. Send Email using Nodemailer
      if (status === 'SUCCESS') {
        await emailUtil.sendOrderConfirmation(email, orderId, totalAmount, firstName);
      } else {
        logger.warn(`Payment failed for order ${orderId}. Sending failure email (Not implemented yet).`);
      }

      // In a real app, you would also save the notification receipt to K_Notifications table here.
      
      return { success: true, message: 'Payment confirmation email sent' };
    } catch (error) {
      logger.error('Error processing payment event for notification:', error);
      throw error;
    }
  }
}

module.exports = new NotificationService();
