const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');
const config = require('../config/config');

const client = jwksClient({
  jwksUri: `https://cognito-idp.${config.aws.region}.amazonaws.com/${config.aws.cognito.userPoolId}/.well-known/jwks.json`
});

function getKey(header, callback) {
  client.getSigningKey(header.kid, function(err, key) {
    if (err) return callback(err);
    const signingKey = key.publicKey || key.rsaPublicKey;
    callback(null, signingKey);
  });
}

/**
 * requireAuth — verifies Cognito JWT and populates req.user.
 * Returns 401 if token is missing or invalid.
 */
const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Authentication token missing or invalid' });
  }

  const token = authHeader.split(' ')[1];

  jwt.verify(token, getKey, {
    algorithms: ['RS256'],
    issuer: `https://cognito-idp.${config.aws.region}.amazonaws.com/${config.aws.cognito.userPoolId}`
  }, (err, decoded) => {
    if (err) {
      return res.status(401).json({ success: false, message: 'Unauthorized', error: err.message });
    }
    req.user = decoded;
    next();
  });
};

module.exports = { requireAuth };
