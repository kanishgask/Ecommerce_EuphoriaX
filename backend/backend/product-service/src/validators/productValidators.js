const Joi = require('joi');

const createProductSchema = Joi.object({
  name: Joi.string().min(2).max(200).required(),
  description: Joi.string().max(5000).required(),
  category: Joi.string().max(100).required(),
  brand: Joi.string().max(100).allow('', null),
  price: Joi.number().positive().precision(2).required(),
  currency: Joi.string().length(3).uppercase().default('USD'),
  stockHint: Joi.number().integer().min(0).default(0),
  images: Joi.array().items(Joi.string().uri()).default([]),
  attributes: Joi.object().default({}),
  status: Joi.string().valid('ACTIVE', 'DRAFT', 'ARCHIVED').default('ACTIVE')
});

const updateProductSchema = Joi.object({
  name: Joi.string().min(2).max(200),
  description: Joi.string().max(5000),
  category: Joi.string().max(100),
  brand: Joi.string().max(100).allow('', null),
  price: Joi.number().positive().precision(2),
  currency: Joi.string().length(3).uppercase(),
  stockHint: Joi.number().integer().min(0),
  images: Joi.array().items(Joi.string().uri()),
  attributes: Joi.object(),
  status: Joi.string().valid('ACTIVE', 'DRAFT', 'ARCHIVED'),
  version: Joi.number().integer().required()
});

module.exports = { createProductSchema, updateProductSchema };
