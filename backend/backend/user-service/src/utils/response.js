function success(res, statusCode, data, message = 'Success') {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString()
  });
}

function failure(res, statusCode, message = 'Error', errors = null) {
  return res.status(statusCode).json({
    success: false,
    message,
    errors,
    timestamp: new Date().toISOString()
  });
}

module.exports = { success, failure };
