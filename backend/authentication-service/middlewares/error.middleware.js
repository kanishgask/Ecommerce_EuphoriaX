const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  
  const statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Handling AWS Cognito Specific Errors
  if (err.name === 'NotAuthorizedException') {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
  if (err.name === 'UserNotFoundException') {
    return res.status(404).json({ success: false, message: 'User not found' });
  }
  if (err.name === 'UsernameExistsException') {
    return res.status(400).json({ success: false, message: 'User already exists' });
  }
  if (err.isJoi) {
    return res.status(400).json({ success: false, message: err.details[0].message });
  }

  res.status(statusCode).json({
    success: false,
    message
  });
};

module.exports = errorHandler;
