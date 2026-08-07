const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  
  const statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  if (err.isJoi) {
    return res.status(400).json({ success: false, message: err.details[0].message });
  }

  res.status(statusCode).json({
    success: false,
    message
  });
};

module.exports = errorHandler;
