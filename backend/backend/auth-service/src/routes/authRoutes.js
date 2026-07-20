const express = require('express');
const controller = require('../controllers/authController');
const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/authenticate');
const { authRateLimiter } = require('../middleware/rateLimiter');
const {
  registerSchema, loginSchema, verifyEmailSchema, forgotPasswordSchema,
  resetPasswordSchema, changePasswordSchema, refreshTokenSchema
} = require('../validators/authValidators');

const router = express.Router();

router.post('/register', authRateLimiter, validate(registerSchema), controller.register);
router.post('/verify-email', authRateLimiter, validate(verifyEmailSchema), controller.verifyEmail);
router.post('/resend-verification', authRateLimiter, controller.resendVerification);
router.post('/login', authRateLimiter, validate(loginSchema), controller.login);
router.post('/refresh-token', validate(refreshTokenSchema), controller.refresh);
router.post('/logout', controller.logout);
router.post('/forgot-password', authRateLimiter, validate(forgotPasswordSchema), controller.forgotPassword);
router.post('/reset-password', authRateLimiter, validate(resetPasswordSchema), controller.resetPassword);
router.post('/change-password', validate(changePasswordSchema), controller.changePassword);
router.get('/me', authenticate, controller.me);

module.exports = router;
