const Joi = require('joi');

const processPaymentSchema = Joi.object({
  orderId: Joi.string().required(),
  userId: Joi.string().required(),
  amount: Joi.number().positive().required(),
  paymentMethod: Joi.object({
    cardNumber: Joi.string().length(16).required(),
    expiry: Joi.string().pattern(/^(0[1-9]|1[0-2])\/?([0-9]{2})$/).required(),
    cvv: Joi.string().length(3).required()
  }).required()
});

module.exports = {
  processPaymentSchema
};
