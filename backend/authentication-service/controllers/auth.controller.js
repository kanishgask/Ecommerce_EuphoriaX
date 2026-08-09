const authService = require('../services/auth.service');
const { 
  registerSchema, 
  loginSchema,
  verifyEmailSchema,
  forgotPasswordSchema, 
  resetPasswordSchema 
} = require('../validators/auth.validator');

class AuthController {
  async register(req, res, next) {
    try {
      const value = await registerSchema.validateAsync(req.body);
      const user = await authService.register(value);
      res.status(201).json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const value = await loginSchema.validateAsync(req.body);
      const tokens = await authService.login(value);
      res.status(200).json({ success: true, data: tokens });
    } catch (error) {
      next(error);
    }
  }

  async verifyEmail(req, res, next) {
    try {
      const value = await verifyEmailSchema.validateAsync(req.body);
      await authService.verifyEmail(value.email, value.code);
      res.status(200).json({ success: true, message: 'Email verified successfully' });
    } catch (error) {
      next(error);
    }
  }

  async forgotPassword(req, res, next) {
    try {
      const value = await forgotPasswordSchema.validateAsync(req.body);
      await authService.forgotPassword(value.email);
      res.status(200).json({ success: true, message: 'Password reset code sent successfully' });
    } catch (error) {
      next(error);
    }
  }

  async resetPassword(req, res, next) {
    try {
      const value = await resetPasswordSchema.validateAsync(req.body);
      await authService.resetPassword(value);
      res.status(200).json({ success: true, message: 'Password reset successfully' });
    } catch (error) {
      next(error);
    }
  }

  async getProfile(req, res, next) {
    try {
      // req.user is populated by the requireAuth middleware
      const userId = req.user.sub; 
      const profile = await authService.getProfile(userId);
      res.status(200).json({ success: true, data: profile });
    } catch (error) {
      next(error);
    }
  }

  async getAllUsers(req, res, next) {
    try {
      const users = await authService.getAllUsers();
      res.status(200).json({ success: true, data: users });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();
