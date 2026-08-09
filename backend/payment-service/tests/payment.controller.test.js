const paymentController = require('../controllers/payment.controller');
const paymentService = require('../services/payment.service');
const { processPaymentSchema } = require('../validators/payment.validator');

jest.mock('../services/payment.service');
jest.mock('../validators/payment.validator');

describe('PaymentController', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      body: {},
      user: { sub: 'user-123' },
      params: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe('processPayment', () => {
    it('should return 403 if userId does not match', async () => {
      processPaymentSchema.validateAsync.mockResolvedValue({ userId: 'other-user' });

      await paymentController.processPayment(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Unauthorized userId mismatch' });
    });

    it('should process payment and return 200 on success', async () => {
      const mockValue = { userId: 'user-123', amount: 100 };
      processPaymentSchema.validateAsync.mockResolvedValue(mockValue);
      paymentService.processPayment.mockResolvedValue({ id: 'payment-1' });

      await paymentController.processPayment(req, res, next);

      expect(paymentService.processPayment).toHaveBeenCalledWith(mockValue);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, data: { id: 'payment-1' } });
    });

    it('should call next with error if validation fails', async () => {
      const error = new Error('Validation error');
      processPaymentSchema.validateAsync.mockRejectedValue(error);

      await paymentController.processPayment(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getPaymentHistoryByOrderId', () => {
    it('should return payment history for an order', async () => {
      req.params.orderId = 'order-1';
      paymentService.getPaymentHistoryByOrderId.mockResolvedValue([{ id: 'p1' }]);

      await paymentController.getPaymentHistoryByOrderId(req, res, next);

      expect(paymentService.getPaymentHistoryByOrderId).toHaveBeenCalledWith('order-1');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, data: [{ id: 'p1' }] });
    });

    it('should call next on error', async () => {
      const error = new Error('DB Error');
      paymentService.getPaymentHistoryByOrderId.mockRejectedValue(error);

      await paymentController.getPaymentHistoryByOrderId(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getPaymentHistoryByUser', () => {
    it('should return payment history for a user', async () => {
      paymentService.getPaymentHistoryByUser.mockResolvedValue([{ id: 'p2' }]);

      await paymentController.getPaymentHistoryByUser(req, res, next);

      expect(paymentService.getPaymentHistoryByUser).toHaveBeenCalledWith('user-123');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, data: [{ id: 'p2' }] });
    });

    it('should call next on error', async () => {
      const error = new Error('Error');
      paymentService.getPaymentHistoryByUser.mockRejectedValue(error);

      await paymentController.getPaymentHistoryByUser(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getAllPayments', () => {
    it('should return all payments', async () => {
      paymentService.getAllPayments.mockResolvedValue([{ id: 'p3' }]);

      await paymentController.getAllPayments(req, res, next);

      expect(paymentService.getAllPayments).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, data: [{ id: 'p3' }] });
    });

    it('should call next on error', async () => {
      const error = new Error('Error');
      paymentService.getAllPayments.mockRejectedValue(error);

      await paymentController.getAllPayments(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
