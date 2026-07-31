 const {
  CognitoIdentityProviderClient,
  SignUpCommand,
  ConfirmSignUpCommand,
  ResendConfirmationCodeCommand,
  InitiateAuthCommand,
  GlobalSignOutCommand,
  ForgotPasswordCommand,
  ConfirmForgotPasswordCommand,
  ChangePasswordCommand,
  GetUserCommand
} = require('@aws-sdk/client-cognito-identity-provider');

const { computeSecretHash } = require('../utils/secretHash');
const { AppError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

const client = new CognitoIdentityProviderClient({ region: process.env.AWS_REGION });
const CLIENT_ID = process.env.COGNITO_CLIENT_ID;

function mapCognitoError(err) {
  const map = {
    UsernameExistsException: [409, 'An account with this email already exists'],
    NotAuthorizedException: [401, 'Incorrect email or password'],
    UserNotFoundException: [404, 'User not found'],
    CodeMismatchException: [400, 'Invalid verification code'],
    ExpiredCodeException: [400, 'Verification code has expired'],
    InvalidPasswordException: [422, 'Password does not meet complexity requirements'],
    LimitExceededException: [429, 'Too many attempts, please try again later'],
    UserNotConfirmedException: [403, 'Please verify your email before logging in']
  };
  const [status, message] = map[err.name] || [500, 'Authentication service error'];
  logger.error('Cognito error', { name: err.name, message: err.message });
  return new AppError(message, status);
}

async function register({ email, password, name, phoneNumber }) {
  try {
    const attributes = [
      { Name: 'email', Value: email },
      { Name: 'name', Value: name }
    ];
    if (phoneNumber) attributes.push({ Name: 'phone_number', Value: phoneNumber });

    const command = new SignUpCommand({
      ClientId: CLIENT_ID,
      Username: email,
      Password: password,
      UserAttributes: attributes,
      SecretHash: computeSecretHash(email)
    });
    const result = await client.send(command);
    return { userSub: result.UserSub, confirmed: result.UserConfirmed };
  } catch (err) {
    throw mapCognitoError(err);
  }
}

async function confirmSignUp(email, code) {
  try {
    const command = new ConfirmSignUpCommand({
      ClientId: CLIENT_ID,
      Username: email,
      ConfirmationCode: code,
      SecretHash: computeSecretHash(email)
    });
    await client.send(command);
    return true;
  } catch (err) {
    throw mapCognitoError(err);
  }
}

async function resendVerification(email) {
  try {
    const command = new ResendConfirmationCodeCommand({
      ClientId: CLIENT_ID,
      Username: email,
      SecretHash: computeSecretHash(email)
    });
    await client.send(command);
    return true;
  } catch (err) {
    throw mapCognitoError(err);
  }
}

async function login(email, password) {
  try {
    const command = new InitiateAuthCommand({
      AuthFlow: 'USER_PASSWORD_AUTH',
      ClientId: CLIENT_ID,
      AuthParameters: {
        USERNAME: email,
        PASSWORD: password,
        ...(computeSecretHash(email) ? { SECRET_HASH: computeSecretHash(email) } : {})
      }
    });
    const result = await client.send(command);

    if (result.ChallengeName) {
      throw new AppError(`Additional challenge required: ${result.ChallengeName}`, 401);
    }

    return {
      accessToken: result.AuthenticationResult.AccessToken,
      idToken: result.AuthenticationResult.IdToken,
      refreshToken: result.AuthenticationResult.RefreshToken,
      expiresIn: result.AuthenticationResult.ExpiresIn,
      tokenType: result.AuthenticationResult.TokenType
    };
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw mapCognitoError(err);
  }
}

async function refreshTokens(username, refreshToken) {
  try {
    const command = new InitiateAuthCommand({
      AuthFlow: 'REFRESH_TOKEN_AUTH',
      ClientId: CLIENT_ID,
      AuthParameters: {
        REFRESH_TOKEN: refreshToken,
        ...(computeSecretHash(username) ? { SECRET_HASH: computeSecretHash(username) } : {})
      }
    });
    const result = await client.send(command);
    return {
      accessToken: result.AuthenticationResult.AccessToken,
      idToken: result.AuthenticationResult.IdToken,
      expiresIn: result.AuthenticationResult.ExpiresIn
    };
  } catch (err) {
    throw mapCognitoError(err);
  }
}

async function logout(accessToken) {
  try {
    const command = new GlobalSignOutCommand({ AccessToken: accessToken });
    await client.send(command);
    return true;
  } catch (err) {
    throw mapCognitoError(err);
  }
}

async function forgotPassword(email) {
  try {
    const command = new ForgotPasswordCommand({
      ClientId: CLIENT_ID,
      Username: email,
      SecretHash: computeSecretHash(email)
    });
    await client.send(command);
    return true;
  } catch (err) {
    throw mapCognitoError(err);
  }
}

async function confirmForgotPassword(email, code, newPassword) {
  try {
    const command = new ConfirmForgotPasswordCommand({
      ClientId: CLIENT_ID,
      Username: email,
      ConfirmationCode: code,
      Password: newPassword,
      SecretHash: computeSecretHash(email)
    });
    await client.send(command);
    return true;
  } catch (err) {
    throw mapCognitoError(err);
  }
}

async function changePassword(accessToken, previousPassword, newPassword) {
  try {
    const command = new ChangePasswordCommand({
      AccessToken: accessToken,
      PreviousPassword: previousPassword,
      ProposedPassword: newPassword
    });
    await client.send(command);
    return true;
  } catch (err) {
    throw mapCognitoError(err);
  }
}

async function getUser(accessToken) {
  try {
    const command = new GetUserCommand({ AccessToken: accessToken });
    const result = await client.send(command);
    const attrs = {};
    result.UserAttributes.forEach((a) => { attrs[a.Name] = a.Value; });
    return { username: result.Username, attributes: attrs };
  } catch (err) {
    throw mapCognitoError(err);
  }
}

module.exports = {
  register,
  confirmSignUp,
  resendVerification,
  login,
  refreshTokens,
  logout,
  forgotPassword,
  confirmForgotPassword,
  changePassword,
  getUser
};
// test
