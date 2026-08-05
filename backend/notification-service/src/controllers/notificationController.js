const notificationService = require('../services/notificationService');

async function list(req, res, next) {
  try {
    // Assuming auth middleware sets req.user
    const userId = req.user ? req.user.id : req.query.userId;
    const items = await notificationService.getUserNotifications(userId);
    res.json({ success: true, data: items });
  } catch (err) { next(err); }
}

async function markRead(req, res, next) {
  try {
    const item = await notificationService.markRead(req.params.id);
    res.json({ success: true, data: item });
  } catch (err) { next(err); }
}

async function remove(req, res, next) {
  try {
    await notificationService.deleteNotif(req.params.id);
    res.json({ success: true, message: 'Deleted' });
  } catch (err) { next(err); }
}

module.exports = { list, markRead, remove };