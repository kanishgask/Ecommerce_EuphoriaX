const logger = require('../utils/logger');
const AppError = require('../utils/AppError');

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error using Winston
  logger.error(`Error: ${err.message}`, { 
    stack: err.stack,
    path: req.originalUrl,
    method: req.method,
    ip: req.ip
  });
  
  if (err.isJoi) {
    return res.status(400).json({ success: false, message: err.details[0].message });
  }

  // Handle specific AWS / DB Errors if needed
  if (err.name === 'ValidationException') {
    error = new AppError(err.message, 400);
  }

  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;
