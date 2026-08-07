const nodemailer = require('nodemailer');
const logger = require('./logger');

// Create a transporter using Gmail SMTP
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS
  }
});

const sendOrderConfirmation = async (email, orderId, amount, userName) => {
  try {
    const html = `
      <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px;">
        <h2 style="color: #6366f1;">Order Confirmation</h2>
        <p>Dear <strong>${userName}</strong>,</p>
        <p>Thank you for shopping with Euphoria! Your order has been successfully placed and payment has been processed.</p>
        
        <div style="background-color: #f8fafc; padding: 15px; border-radius: 6px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #334155;">Order Details</h3>
          <p style="margin-bottom: 5px;"><strong>Order ID:</strong> ${orderId}</p>
          <p style="margin-bottom: 0;"><strong>Total Amount:</strong> $${amount}</p>
        </div>
        
        <p>We will notify you again once your items are shipped.</p>
        <br/>
        <p>Best regards,<br/>The Euphoria Team</p>
      </div>
    `;

    const info = await transporter.sendMail({
      from: `"Euphoria Store" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: `Order Confirmation - #${orderId}`,
      html: html
    });

    logger.info(`Email sent successfully to ${email}. MessageId: ${info.messageId}`);
    return info;
  } catch (error) {
    logger.error('Error sending email:', error);
    throw error;
  }
};

module.exports = {
  sendOrderConfirmation
};
