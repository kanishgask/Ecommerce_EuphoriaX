const logger = require('../utils/logger');
const AppError = require('../utils/AppError');

const errorHandler = (err, req, res, next) => {
  // Log the error
  logger.error(err.message, { stack: err.stack });

  // Handle Joi validation errors
  if (err.isJoi) {
    return res.status(400).json({ success: false, message: err.details[0].message });
  }

  // If it's our custom AppError (Operational Error)
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message
    });
  }

  // For unhandled programming errors, don't leak details in production
  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message
  });
};

module.exports = errorHandler;
