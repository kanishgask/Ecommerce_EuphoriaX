const cognitoService = require('../services/cognitoService');
const { success } = require('../utils/response');

async function register(req, res, next) {
  try {
    const result = await cognitoService.register(req.body);
    return success(res, 201, result, 'Registration successful. Please verify your email.');
  } catch (err) { next(err); }
}

async function verifyEmail(req, res, next) {
  try {
    await cognitoService.confirmSignUp(req.body.email, req.body.code);
    return success(res, 200, null, 'Email verified successfully. You can now log in.');
  } catch (err) { next(err); }
}

async function resendVerification(req, res, next) {
  try {
    await cognitoService.resendVerification(req.body.email);
    return success(res, 200, null, 'Verification code resent.');
  } catch (err) { next(err); }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const tokens = await cognitoService.login(email, password);
    return success(res, 200, tokens, 'Login successful');
  } catch (err) { next(err); }
}

async function refresh(req, res, next) {
  try {
    const { username, refreshToken } = req.body;
    const tokens = await cognitoService.refreshTokens(username, refreshToken);
    return success(res, 200, tokens, 'Token refreshed');
  } catch (err) { next(err); }
}

async function logout(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return success(res, 200, null, 'Already logged out');
    await cognitoService.logout(token);
    return success(res, 200, null, 'Logged out successfully');
  } catch (err) { next(err); }
}

async function forgotPassword(req, res, next) {
  try {
    await cognitoService.forgotPassword(req.body.email);
    return success(res, 200, null, 'Password reset code sent to email');
  } catch (err) { next(err); }
}

async function resetPassword(req, res, next) {
  try {
    const { email, code, newPassword } = req.body;
    await cognitoService.confirmForgotPassword(email, code, newPassword);
    return success(res, 200, null, 'Password reset successfully');
  } catch (err) { next(err); }
}

async function changePassword(req, res, next) {
  try {
    const { accessToken, previousPassword, newPassword } = req.body;
    await cognitoService.changePassword(accessToken, previousPassword, newPassword);
    return success(res, 200, null, 'Password changed successfully');
  } catch (err) { next(err); }
}

async function me(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    const user = await cognitoService.getUser(token);
    return success(res, 200, user, 'Current user retrieved');
  } catch (err) { next(err); }
}

module.exports = {
  register, verifyEmail, resendVerification, login, refresh,
  logout, forgotPassword, resetPassword, changePassword, me
};
