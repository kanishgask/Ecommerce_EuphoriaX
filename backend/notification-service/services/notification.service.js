const emailService = require('./email.service');

class NotificationService {
  async sendOrderConfirmation(data) {
    const { email, orderId, totalAmount, userName } = data;
    
    const subject = `Order Confirmation - #${orderId}`;
    const text = `Hi ${userName},\n\nThank you for your order! Your order #${orderId} for $${totalAmount} has been confirmed.`;
    const html = `
      <h2>Hi ${userName},</h2>
      <p>Thank you for your order!</p>
      <p>Your order <strong>#${orderId}</strong> for <strong>$${totalAmount}</strong> has been confirmed.</p>
    `;

    await emailService.sendEmail(email, subject, text, html);
    return { success: true, message: 'Order confirmation email sent' };
  }

  async sendPaymentConfirmation(data) {
    const { email, orderId, amount, status, userName } = data;
    
    const subject = `Payment ${status === 'SUCCESS' ? 'Successful' : 'Failed'} - Order #${orderId}`;
    
    let text, html;
    if (status === 'SUCCESS') {
      text = `Hi ${userName},\n\nWe have successfully received your payment of $${amount} for order #${orderId}.`;
      html = `
        <h2>Hi ${userName},</h2>
        <p>We have successfully received your payment of <strong>$${amount}</strong> for order <strong>#${orderId}</strong>.</p>
      `;
    } else {
      text = `Hi ${userName},\n\nYour payment of $${amount} for order #${orderId} was declined. Please try again.`;
      html = `
        <h2>Hi ${userName},</h2>
        <p style="color: red;">Your payment of <strong>$${amount}</strong> for order <strong>#${orderId}</strong> was declined.</p>
        <p>Please update your payment method and try again.</p>
      `;
    }

    await emailService.sendEmail(email, subject, text, html);
    return { success: true, message: 'Payment confirmation email sent' };
  }
}

module.exports = new NotificationService();
