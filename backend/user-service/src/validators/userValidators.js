const Joi = require('joi');

const addressSchema = Joi.object({
  label: Joi.string().max(50).required(),
  line1: Joi.string().max(200).required(),
  line2: Joi.string().max(200).allow('', null),
  city: Joi.string().max(100).required(),
  state: Joi.string().max(100).required(),
  postalCode: Joi.string().max(20).required(),
  country: Joi.string().max(100).required(),
  isDefault: Joi.boolean().default(false)
});

const updateProfileSchema = Joi.object({
  name: Joi.string().min(2).max(100),
  phoneNumber: Joi.string().pattern(/^\+[1-9]\d{6,14}$/).allow(null, ''),
  addresses: Joi.array().items(addressSchema),
  version: Joi.number().integer().required()
});

const updateRoleSchema = Joi.object({
  role: Joi.string().valid('USER', 'ADMIN').required(),
  version: Joi.number().integer().required()
});

const updateStatusSchema = Joi.object({
  status: Joi.string().valid('ACTIVE', 'SUSPENDED').required(),
  version: Joi.number().integer().required()
});

module.exports = { updateProfileSchema, updateRoleSchema, updateStatusSchema };
