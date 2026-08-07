const logger = require('../utils/logger');

function errorHandler(err, req, res, next) {
  logger.error(err.message, { stack: err.stack, path: req.path });
  res.status(err.statusCode || 500).json({ success: false, message: err.message || 'Internal server error' });
}

class AppError extends Error {
  constructor(message, statusCode = 400, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
  }
}

module.exports = { errorHandler, AppError };
