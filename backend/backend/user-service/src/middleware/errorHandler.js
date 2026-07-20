const logger = require('../utils/logger');
const { failure } = require('../utils/response');

function errorHandler(err, req, res, next) {
  logger.error(err.message, { stack: err.stack, path: req.path });

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';
  return failure(res, statusCode, message, err.details || null);
}

class AppError extends Error {
  constructor(message, statusCode = 400, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
  }
}

module.exports = { errorHandler, AppError };
