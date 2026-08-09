const paymentRepository = require('../repositories/payment.repository');
const { PutCommand, QueryCommand, ScanCommand } = require('@aws-sdk/lib-dynamodb');
const { ddbDocClient } = require('../config/aws');

jest.mock('@aws-sdk/lib-dynamodb', () => ({
  PutCommand: jest.fn(),
  QueryCommand: jest.fn(),
  ScanCommand: jest.fn()
}));
jest.mock('../config/aws', () => ({
  ddbDocClient: {
    send: jest.fn()
  }
}));

describe('PaymentRepository', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('savePayment', () => {
    it('should save payment successfully', async () => {
      ddbDocClient.send.mockResolvedValue({});
      const payment = { id: 'p1', amount: 100 };
      
      const result = await paymentRepository.savePayment(payment);
      
      expect(PutCommand).toHaveBeenCalled();
      expect(ddbDocClient.send).toHaveBeenCalled();
      expect(result).toEqual(payment);
    });
  });

  describe('getPaymentsByOrderId', () => {
    it('should return payments by order id', async () => {
      const items = [{ id: 'p1', orderId: 'o1' }];
      ddbDocClient.send.mockResolvedValue({ Items: items });
      
      const result = await paymentRepository.getPaymentsByOrderId('o1');
      
      expect(QueryCommand).toHaveBeenCalled();
      expect(result).toEqual(items);
    });

    it('should return empty array on error', async () => {
      ddbDocClient.send.mockRejectedValue(new Error('DynamoDB Error'));
      
      const result = await paymentRepository.getPaymentsByOrderId('o1');
      
      expect(result).toEqual([]);
    });
  });

  describe('getPaymentsByUser', () => {
    it('should return payments by user id', async () => {
      const items = [{ id: 'p1', userId: 'u1' }];
      ddbDocClient.send.mockResolvedValue({ Items: items });
      
      const result = await paymentRepository.getPaymentsByUser('u1');
      
      expect(QueryCommand).toHaveBeenCalled();
      expect(result).toEqual(items);
    });

    it('should return empty array on error', async () => {
      ddbDocClient.send.mockRejectedValue(new Error('DynamoDB Error'));
      
      const result = await paymentRepository.getPaymentsByUser('u1');
      
      expect(result).toEqual([]);
    });
  });

  describe('getAllPayments', () => {
    it('should return all payments', async () => {
      const items = [{ id: 'p1' }];
      ddbDocClient.send.mockResolvedValue({ Items: items });
      
      const result = await paymentRepository.getAllPayments();
      
      expect(ScanCommand).toHaveBeenCalled();
      expect(result).toEqual(items);
    });

    it('should return empty array on error', async () => {
      ddbDocClient.send.mockRejectedValue(new Error('DynamoDB Error'));
      
      const result = await paymentRepository.getAllPayments();
      
      expect(result).toEqual([]);
    });
  });
});
