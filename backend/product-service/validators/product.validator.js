const Joi = require('joi');

const createProductSchema = Joi.object({
  name: Joi.string().min(2).max(150).required(),
  description: Joi.string().max(1000).required(),
  price: Joi.number().positive().precision(2).required(),
  category: Joi.string().required(),
  stock: Joi.number().integer().min(0).required(),
  imageUrl: Joi.string().uri().optional()
});

const updateProductSchema = Joi.object({
  name: Joi.string().min(2).max(150).optional(),
  description: Joi.string().max(1000).optional(),
  price: Joi.number().positive().precision(2).optional(),
  category: Joi.string().optional(),
  stock: Joi.number().integer().min(0).optional(),
  imageUrl: Joi.string().uri().optional()
}).min(1);

const searchSchema = Joi.object({
  query: Joi.string().optional(),
  category: Joi.string().optional()
});

module.exports = {
  createProductSchema,
  updateProductSchema,
  searchSchema
};
