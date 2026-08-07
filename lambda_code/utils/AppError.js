class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true; // Indicates this is a trusted, known error (not a programming bug)

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
