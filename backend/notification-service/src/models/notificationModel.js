const { v4: uuidv4 } = require('uuid');

function newNotification(input) {
  const now = new Date().toISOString();
  return {
    notificationId: uuidv4(),
    userId: input.userId,
    type: input.type, // ORDER, PAYMENT, INVENTORY, SYSTEM
    title: input.title,
    message: input.message,
    read: false,
    createdAt: now
  };
}

module.exports = { newNotification };