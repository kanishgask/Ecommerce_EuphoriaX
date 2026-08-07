const Joi = require('joi');

const updateStockSchema = Joi.object({
  quantity: Joi.number().integer().min(0).required()
});

const reserveInventorySchema = Joi.object({
  orderId: Joi.string().required(),
  items: Joi.array().items(
    Joi.object({
      productId: Joi.string().required(),
      quantity: Joi.number().integer().min(1).required()
    })
  ).min(1).required()
});

module.exports = {
  updateStockSchema,
  reserveInventorySchema
};
