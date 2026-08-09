const paymentService = require('../services/payment.service');
const paymentRepository = require('../repositories/payment.repository');
const eventPublisher = require('../utils/publisher');

jest.mock('../repositories/payment.repository');
jest.mock('../utils/publisher');
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mocked-uuid')
}));

describe('PaymentService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.SNS_PAYMENT_EVENTS_TOPIC = 'arn:aws:sns:us-east-1:123456789012:PaymentEvents';
  });

  describe('processPayment', () => {
    it('should process payment successfully when cvv is not 999', async () => {
      const paymentData = {
        orderId: 'order-123',
        userId: 'user-456',
        amount: 100,
        paymentMethod: { cvv: '123' }
      };

      paymentRepository.savePayment.mockResolvedValue();
      eventPublisher.publish.mockResolvedValue();

      const result = await paymentService.processPayment(paymentData);

      expect(result.status).toBe('SUCCESS');
      expect(result.id).toBe('mocked-uuid');
      expect(paymentRepository.savePayment).toHaveBeenCalledWith(expect.objectContaining({
        id: 'mocked-uuid',
        orderId: 'order-123',
        userId: 'user-456',
        amount: 100,
        status: 'SUCCESS'
      }));
      expect(eventPublisher.publish).toHaveBeenCalledWith(
        process.env.SNS_PAYMENT_EVENTS_TOPIC,
        'PaymentSuccess',
        expect.objectContaining({ id: 'mocked-uuid' })
      );
    });

    it('should fail payment when cvv is 999', async () => {
      const paymentData = {
        orderId: 'order-123',
        userId: 'user-456',
        amount: 100,
        paymentMethod: { cvv: '999' }
      };

      paymentRepository.savePayment.mockResolvedValue();
      eventPublisher.publish.mockResolvedValue();

      await expect(paymentService.processPayment(paymentData)).rejects.toThrow('Payment declined by the gateway');

      expect(paymentRepository.savePayment).toHaveBeenCalledWith(expect.objectContaining({
        id: 'mocked-uuid',
        orderId: 'order-123',
        userId: 'user-456',
        amount: 100,
        status: 'FAILED'
      }));
      expect(eventPublisher.publish).toHaveBeenCalledWith(
        process.env.SNS_PAYMENT_EVENTS_TOPIC,
        'PaymentFailed',
        expect.objectContaining({ id: 'mocked-uuid' })
      );
    });
  });
  describe('getPaymentHistoryByOrderId', () => {
    it('should return payment history by order id', async () => {
      const mockPayments = [{ id: 'p1', orderId: 'order-123' }];
      paymentRepository.getPaymentsByOrderId.mockResolvedValue(mockPayments);

      const result = await paymentService.getPaymentHistoryByOrderId('order-123');

      expect(paymentRepository.getPaymentsByOrderId).toHaveBeenCalledWith('order-123');
      expect(result).toEqual(mockPayments);
    });
  });

  describe('getPaymentHistoryByUser', () => {
    it('should return payment history by user id', async () => {
      const mockPayments = [{ id: 'p2', userId: 'user-456' }];
      paymentRepository.getPaymentsByUser.mockResolvedValue(mockPayments);

      const result = await paymentService.getPaymentHistoryByUser('user-456');

      expect(paymentRepository.getPaymentsByUser).toHaveBeenCalledWith('user-456');
      expect(result).toEqual(mockPayments);
    });
  });

  describe('getAllPayments', () => {
    it('should return all payments', async () => {
      const mockPayments = [{ id: 'p3' }];
      paymentRepository.getAllPayments.mockResolvedValue(mockPayments);

      const result = await paymentService.getAllPayments();

      expect(paymentRepository.getAllPayments).toHaveBeenCalled();
      expect(result).toEqual(mockPayments);
    });
  });
});
