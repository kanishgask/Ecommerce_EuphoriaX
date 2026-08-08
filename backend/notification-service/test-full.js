const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand } = require('@aws-sdk/lib-dynamodb');
const nodemailer = require('nodemailer');

const client = new DynamoDBClient({ region: 'ap-southeast-1' });
const ddbDocClient = DynamoDBDocumentClient.from(client);

async function test() {
  // Step 1: Check a recent order
  console.log('Step 1: Checking K_Orders for a recent order...');
  const { Item: order } = await ddbDocClient.send(new GetCommand({
    TableName: 'K_Orders',
    Key: { id: '1be5882c-7aef-4598-8616-4685bfe06e7f' }
  }));
  console.log('Order found:', JSON.stringify(order, null, 2));

  // Step 2: Check user
  if (order) {
    console.log('\nStep 2: Checking K_Users for userId:', order.userId);
    const { Item: user } = await ddbDocClient.send(new GetCommand({
      TableName: 'K_Users',
      Key: { id: order.userId }
    }));
    console.log('User found:', JSON.stringify(user, null, 2));

    // Step 3: Try sending email
    if (user && user.email) {
      console.log('\nStep 3: Sending test email to:', user.email);
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'kanishgas025@gmail.com',
          pass: 'qmuhgtbomvxhaicp'
        }
      });
      const info = await transporter.sendMail({
        from: '"Euphoria Store" <kanishgas025@gmail.com>',
        to: user.email,
        subject: `Order Confirmation - #${order.id}`,
        html: `<h2>Order Confirmed!</h2><p>Dear ${user.firstName || user.email},</p><p>Your order for $${order.totalAmount} has been confirmed!</p><p>Order ID: ${order.id}</p>`
      });
      console.log('Email sent!', info.messageId);
    } else {
      console.error('No user or email found!');
    }
  } else {
    console.error('Order not found!');
  }
}

test().catch(console.error);
