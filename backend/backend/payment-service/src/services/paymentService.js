const paymentRepo = require('../repositories/paymentRepository');
const { newPayment } = require('../models/paymentModel');
const logger = require('../utils/logger');
const { v4: uuidv4 } = require('uuid');

async function createPayment(data) {
  const payment = newPayment(data);
  return await paymentRepo.create(payment);
}

async function verifyPayment(paymentId) {
  const payment = await paymentRepo.getById(paymentId);
  if (!payment) throw new Error('Payment not found');
  if (payment.status !== 'PENDING') return payment;
  
  // Mocking payment gateway verification
  const transactionId = 'txn_' + uuidv4().replace(/-/g, '');
  const status = 'SUCCESS';
  
  const updated = await paymentRepo.updateStatus(paymentId, status, transactionId, payment.version);
  // Publish PaymentSuccessful event to SNS
  logger.info(`Payment ${paymentId} successful, transaction ${transactionId}`);
  return updated;
}

async function processRefund(paymentId) {
  const payment = await paymentRepo.getById(paymentId);
  if (!payment) throw new Error('Payment not found');
  if (payment.status !== 'SUCCESS') throw new Error('Can only refund successful payments');
  
  const updated = await paymentRepo.updateStatus(paymentId, 'REFUNDED', payment.transactionId, payment.version);
  // Publish RefundCompleted event to SNS
  logger.info(`Payment ${paymentId} refunded`);
  return updated;
}

module.exports = { createPayment, verifyPayment, processRefund };