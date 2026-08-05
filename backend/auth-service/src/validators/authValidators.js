const Joi = require('joi');

const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/).required()
    .messages({ 'string.pattern.base': 'Password must include upper, lower, number and special character' }),
  name: Joi.string().min(2).max(100).required(),
  phoneNumber: Joi.string().pattern(/^\+[1-9]\d{6,14}$/).optional()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

const verifyEmailSchema = Joi.object({
  email: Joi.string().email().required(),
  code: Joi.string().length(6).required()
});

const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required()
});

const resetPasswordSchema = Joi.object({
  email: Joi.string().email().required(),
  code: Joi.string().length(6).required(),
  newPassword: Joi.string().min(8).required()
});

const changePasswordSchema = Joi.object({
  accessToken: Joi.string().required(),
  previousPassword: Joi.string().required(),
  newPassword: Joi.string().min(8).required()
});

const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required(),
  username: Joi.string().required()
});

module.exports = {
  registerSchema,
  loginSchema,
  verifyEmailSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  refreshTokenSchema
};
