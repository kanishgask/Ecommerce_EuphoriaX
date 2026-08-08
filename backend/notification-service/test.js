require('dotenv').config();
const emailUtil = require('./utils/email');

async function test() {
  console.log('Sending test email to kanishgas025@gmail.com...');
  try {
    await emailUtil.sendOrderConfirmation('kanishgas025@gmail.com', 'TEST-ORDER-123', 99.99, 'Kanishga');
    console.log('Success!');
  } catch (err) {
    console.error('Failed:', err);
  }
}

test();
