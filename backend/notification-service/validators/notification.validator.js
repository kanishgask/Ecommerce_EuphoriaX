const Joi = require('joi');

const sendOrderConfirmationSchema = Joi.object({
  email: Joi.string().email().required(),
  orderId: Joi.string().required(),
  totalAmount: Joi.number().required(),
  userName: Joi.string().required()
});

const sendPaymentConfirmationSchema = Joi.object({
  email: Joi.string().email().required(),
  orderId: Joi.string().required(),
  amount: Joi.number().required(),
  status: Joi.string().valid('SUCCESS', 'FAILED').required(),
  userName: Joi.string().required()
});

module.exports = {
  sendOrderConfirmationSchema,
  sendPaymentConfirmationSchema
};
