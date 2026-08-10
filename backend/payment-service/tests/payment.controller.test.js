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
      // Simulate a regular authenticated user (no admin group)
      user: { sub: 'user-123', 'cognito:groups': [] },
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
    it('should process payment using userId from JWT token (not from body)', async () => {
      // userId is NOT in the validated value — controller injects it from req.user.sub
      const mockValue = { orderId: 'order-1', amount: 100 };
      processPaymentSchema.validateAsync.mockResolvedValue(mockValue);
      paymentService.processPayment.mockResolvedValue({ id: 'payment-1' });

      await paymentController.processPayment(req, res, next);

      // Service must be called with userId from JWT token, not from body
      expect(paymentService.processPayment).toHaveBeenCalledWith({ ...mockValue, userId: 'user-123' });
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
    it('should return payment history that belongs to the authenticated user', async () => {
      req.params.orderId = 'order-1';
      // Service returns payments — one belongs to current user
      paymentService.getPaymentHistoryByOrderId.mockResolvedValue([{ id: 'p1', userId: 'user-123' }]);

      await paymentController.getPaymentHistoryByOrderId(req, res, next);

      expect(paymentService.getPaymentHistoryByOrderId).toHaveBeenCalledWith('order-1');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, data: [{ id: 'p1', userId: 'user-123' }] });
    });

    it('should return 403 if no payments belong to the current user', async () => {
      req.params.orderId = 'order-2';
      // Payment belongs to a different user
      paymentService.getPaymentHistoryByOrderId.mockResolvedValue([{ id: 'p2', userId: 'other-user' }]);

      await paymentController.getPaymentHistoryByOrderId(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Forbidden: you do not own this resource' });
    });

    it('should return all payments for admin users', async () => {
      req.user = { sub: 'admin-1', 'cognito:groups': ['admin'] };
      req.params.orderId = 'order-3';
      const allPayments = [{ id: 'p3', userId: 'other-user' }, { id: 'p4', userId: 'admin-1' }];
      paymentService.getPaymentHistoryByOrderId.mockResolvedValue(allPayments);

      await paymentController.getPaymentHistoryByOrderId(req, res, next);

      // Admin sees all payments without filtering
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, data: allPayments });
    });

    it('should call next on error', async () => {
      const error = new Error('DB Error');
      paymentService.getPaymentHistoryByOrderId.mockRejectedValue(error);

      await paymentController.getPaymentHistoryByOrderId(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getPaymentHistoryByUser', () => {
    it('should return payment history using userId from JWT (not body)', async () => {
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
    it('should return 403 for non-admin users', async () => {
      // req.user has no admin group (set in beforeEach)
      await paymentController.getAllPayments(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Forbidden: admin access required' });
    });

    it('should return all payments for admin users', async () => {
      req.user = { sub: 'admin-1', 'cognito:groups': ['admin'] };
      paymentService.getAllPayments.mockResolvedValue([{ id: 'p3' }]);

      await paymentController.getAllPayments(req, res, next);

      expect(paymentService.getAllPayments).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, data: [{ id: 'p3' }] });
    });

    it('should call next on error for admin when service throws', async () => {
      req.user = { sub: 'admin-1', 'cognito:groups': ['admin'] };
      const error = new Error('Error');
      paymentService.getAllPayments.mockRejectedValue(error);

      await paymentController.getAllPayments(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
