const Joi = require('joi');

const addItemSchema = Joi.object({
  productId: Joi.string().required(),
  quantity: Joi.number().integer().min(1).max(99).default(1)
});

const updateQuantitySchema = Joi.object({
  quantity: Joi.number().integer().min(1).max(99).required()
});

module.exports = { addItemSchema, updateQuantitySchema };
