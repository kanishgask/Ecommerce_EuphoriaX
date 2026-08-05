const Joi = require('joi');

const addressSchema = Joi.object({
  line1: Joi.string().max(200).required(),
  line2: Joi.string().max(200).allow('', null),
  city: Joi.string().max(100).required(),
  state: Joi.string().max(100).required(),
  postalCode: Joi.string().max(20).required(),
  country: Joi.string().max(100).required()
});

const checkoutSchema = Joi.object({
  shippingAddress: addressSchema.required()
});

const updateOrderStatusSchema = Joi.object({
  status: Joi.string().valid('PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED').required(),
  version: Joi.number().integer().required()
});

module.exports = { checkoutSchema, updateOrderStatusSchema };
