const { CognitoJwtVerifier } = require('aws-jwt-verify');
const { AppError } = require('./errorHandler');

// Verifies Cognito ACCESS tokens (used to authorize API calls).
const verifier = CognitoJwtVerifier.create({
  userPoolId: process.env.COGNITO_USER_POOL_ID,
  tokenUse: 'access',
  clientId: process.env.COGNITO_CLIENT_ID
});

async function authenticate(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) throw new AppError('Missing authorization token', 401);

    const payload = await verifier.verify(token);

    req.user = {
      sub: payload.sub,
      username: payload.username || payload['cognito:username'],
      groups: payload['cognito:groups'] || [],
      scope: payload.scope
    };
    next();
  } catch (err) {
    next(new AppError('Invalid or expired token', 401));
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return next(new AppError('Unauthenticated', 401));
    const hasRole = req.user.groups.some((g) => roles.includes(g));
    if (!hasRole) return next(new AppError('Forbidden: insufficient role', 403));
    next();
  };
}

module.exports = { authenticate, requireRole, verifier };
