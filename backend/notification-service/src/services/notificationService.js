const notificationRepo = require('../repositories/notificationRepository');
const { newNotification } = require('../models/notificationModel');

async function createNotification(data) {
  const notification = newNotification(data);
  return await notificationRepo.create(notification);
}

async function getUserNotifications(userId) {
  return await notificationRepo.getByUserId(userId);
}

async function markRead(notificationId) {
  return await notificationRepo.markAsRead(notificationId);
}

async function deleteNotif(notificationId) {
  return await notificationRepo.deleteNotification(notificationId);
}

module.exports = { createNotification, getUserNotifications, markRead, deleteNotif };