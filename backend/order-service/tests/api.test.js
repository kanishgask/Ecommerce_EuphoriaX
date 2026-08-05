const request = require('supertest');
const app = require('../src/index');
const { CognitoJwtVerifier } = require('aws-jwt-verify');
const { DynamoDBDocumentClient } = require('@aws-sdk/lib-dynamodb');
const { SNSClient } = require('@aws-sdk/client-sns');
const axios = require('axios');

jest.mock('aws-jwt-verify', () => ({
  CognitoJwtVerifier: { create: jest.fn().mockReturnValue({ verify: jest.fn() }) }
}));

jest.mock('@aws-sdk/lib-dynamodb', () => {
  const original = jest.requireActual('@aws-sdk/lib-dynamodb');
  return {
    ...original,
    DynamoDBDocumentClient: { from: jest.fn().mockReturnValue({ send: jest.fn() }) },
    GetCommand: jest.fn(), PutCommand: jest.fn(), UpdateCommand: jest.fn(),
    QueryCommand: jest.fn(), ScanCommand: jest.fn()
  };
});

jest.mock('@aws-sdk/client-sns', () => ({
  SNSClient: jest.fn().mockImplementation(() => ({ send: jest.fn() })),
  PublishCommand: jest.fn()
}));

jest.mock('axios');

const ddb = require('../src/utils/dynamoClient');
const verifier = CognitoJwtVerifier.create();

describe('Order Service API', () => {
  beforeEach(() => { jest.clearAllMocks(); });

  describe('POST /api/v1/orders/checkout', () => {
    const checkoutPayload = {
      shippingAddress: {
        label: 'Home',
        line1: '123 Main St',
        city: 'NY',
        state: 'NY',
        postalCode: '10001',
        country: 'USA'
      }
    };

    it('should successfully place an order', async () => {
      verifier.verify.mockResolvedValueOnce({ sub: 'user1' });
      
      // Mock cartClient.getCart
      axios.get.mockResolvedValueOnce({
        data: { data: { items: [{ productId: 'p1', name: 'Item', price: 10, quantity: 1, currency: 'USD' }] } }
      });
      // Mock repository create
      ddb.send.mockResolvedValueOnce({});
      // Mock cartClient.clearCart
      axios.delete.mockResolvedValueOnce({});

      const res = await request(app)
        .post('/api/v1/orders/checkout')
        .set('Authorization', 'Bearer token')
        .send(checkoutPayload);

      expect(res.statusCode).toBe(201);
      expect(res.body.data.status).toBe('PENDING_PAYMENT');
      expect(res.body.data.items.length).toBe(1);
    });

    it('should return 422 if cart is empty', async () => {
      verifier.verify.mockResolvedValueOnce({ sub: 'user1' });
      axios.get.mockResolvedValueOnce({ data: { data: { items: [] } } });

      const res = await request(app)
        .post('/api/v1/orders/checkout')
        .set('Authorization', 'Bearer token')
        .send(checkoutPayload);

      expect(res.statusCode).toBe(422);
      expect(res.body.message).toBe('Cart is empty');
    });

    it('should return 502 if cart service is unreachable', async () => {
      verifier.verify.mockResolvedValueOnce({ sub: 'user1' });
      axios.get.mockRejectedValueOnce(new Error('Network error'));

      const res = await request(app)
        .post('/api/v1/orders/checkout')
        .set('Authorization', 'Bearer token')
        .send(checkoutPayload);

      expect(res.statusCode).toBe(502);
      expect(res.body.message).toBe('Unable to reach cart service');
    });

    it('should still succeed if clearCart fails non-fatally', async () => {
      verifier.verify.mockResolvedValueOnce({ sub: 'user1' });
      axios.get.mockResolvedValueOnce({
        data: { data: { items: [{ productId: 'p1', name: 'Item', price: 10, quantity: 1, currency: 'USD' }] } }
      });
      ddb.send.mockResolvedValueOnce({});
      axios.delete.mockRejectedValueOnce(new Error('Clear failed'));

      const res = await request(app)
        .post('/api/v1/orders/checkout')
        .set('Authorization', 'Bearer token')
        .send(checkoutPayload);

      expect(res.statusCode).toBe(201);
    });

    it('should fail on validation error', async () => {
      verifier.verify.mockResolvedValueOnce({ sub: 'user1' });
      const res = await request(app)
        .post('/api/v1/orders/checkout')
        .set('Authorization', 'Bearer token')
        .send({}); // Missing shippingAddress

      expect(res.statusCode).toBe(422);
      expect(res.body.message).toContain('Validation');
    });
  });

  describe('GET /api/v1/orders/mine', () => {
    it('should list user orders', async () => {
      verifier.verify.mockResolvedValueOnce({ sub: 'user1' });
      ddb.send.mockResolvedValueOnce({ Items: [{ orderId: 'o1' }], LastEvaluatedKey: null });

      const res = await request(app)
        .get('/api/v1/orders/mine')
        .set('Authorization', 'Bearer token');

      expect(res.statusCode).toBe(200);
      expect(res.body.data.items.length).toBe(1);
    });
  });

  describe('GET /api/v1/orders/:orderId', () => {
    it('should return order if user is owner', async () => {
      verifier.verify.mockResolvedValueOnce({ sub: 'user1', groups: [] });
      ddb.send.mockResolvedValueOnce({ Item: { orderId: 'o1', userId: 'user1' } });

      const res = await request(app)
        .get('/api/v1/orders/o1')
        .set('Authorization', 'Bearer token');

      expect(res.statusCode).toBe(200);
    });

    it('should return order if user is ADMIN', async () => {
      verifier.verify.mockResolvedValueOnce({ sub: 'admin', groups: ['ADMIN'], 'cognito:groups': ['ADMIN'] });
      ddb.send.mockResolvedValueOnce({ Item: { orderId: 'o1', userId: 'user1' } });

      const res = await request(app)
        .get('/api/v1/orders/o1')
        .set('Authorization', 'Bearer admin_token');

      expect(res.statusCode).toBe(200);
    });

    it('should return 403 if user is not owner and not ADMIN', async () => {
      verifier.verify.mockResolvedValueOnce({ sub: 'user2', groups: [] });
      ddb.send.mockResolvedValueOnce({ Item: { orderId: 'o1', userId: 'user1' } });

      const res = await request(app)
        .get('/api/v1/orders/o1')
        .set('Authorization', 'Bearer token');

      expect(res.statusCode).toBe(403);
    });

    it('should return 404 if order not found', async () => {
      verifier.verify.mockResolvedValueOnce({ sub: 'user1', groups: [] });
      ddb.send.mockResolvedValueOnce({ Item: null });

      const res = await request(app)
        .get('/api/v1/orders/o1')
        .set('Authorization', 'Bearer token');

      expect(res.statusCode).toBe(404);
    });
  });

  describe('GET /api/v1/orders', () => {
    it('should list all orders if ADMIN', async () => {
      verifier.verify.mockResolvedValueOnce({ sub: 'admin', groups: ['ADMIN'], 'cognito:groups': ['ADMIN'] });
      ddb.send.mockResolvedValueOnce({ Items: [{ orderId: 'o1' }] });

      const res = await request(app)
        .get('/api/v1/orders')
        .set('Authorization', 'Bearer admin_token');

      expect(res.statusCode).toBe(200);
      expect(res.body.data.items.length).toBe(1);
    });
  });

  describe('PATCH /api/v1/orders/:orderId/status', () => {
    it('should update status if ADMIN and valid transition', async () => {
      verifier.verify.mockResolvedValueOnce({ sub: 'admin', groups: ['ADMIN'], 'cognito:groups': ['ADMIN'] });
      ddb.send.mockResolvedValueOnce({ Item: { orderId: 'o1', status: 'PAID' } }); // getById
      ddb.send.mockResolvedValueOnce({ Attributes: { status: 'PROCESSING' } }); // updateStatus

      const res = await request(app)
        .patch('/api/v1/orders/o1/status')
        .set('Authorization', 'Bearer admin_token')
        .send({ status: 'PROCESSING', version: 1 });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.status).toBe('PROCESSING');
    });

    it('should return 422 if invalid status transition', async () => {
      verifier.verify.mockResolvedValueOnce({ sub: 'admin', groups: ['ADMIN'], 'cognito:groups': ['ADMIN'] });
      ddb.send.mockResolvedValueOnce({ Item: { orderId: 'o1', status: 'SHIPPED' } });

      const res = await request(app)
        .patch('/api/v1/orders/o1/status')
        .set('Authorization', 'Bearer admin_token')
        .send({ status: 'PROCESSING', version: 1 }); // cannot go back to PROCESSING

      expect(res.statusCode).toBe(422);
      expect(res.body.message).toContain('Cannot transition order');
    });

    it('should handle concurrency mismatch (409)', async () => {
      verifier.verify.mockResolvedValueOnce({ sub: 'admin', groups: ['ADMIN'], 'cognito:groups': ['ADMIN'] });
      ddb.send.mockResolvedValueOnce({ Item: { orderId: 'o1', status: 'PAID' } });
      
      const conflictError = new Error('Conflict');
      conflictError.name = 'ConditionalCheckFailedException';
      ddb.send.mockRejectedValueOnce(conflictError);

      const res = await request(app)
        .patch('/api/v1/orders/o1/status')
        .set('Authorization', 'Bearer admin_token')
        .send({ status: 'PROCESSING', version: 1 });

      expect(res.statusCode).toBe(409);
    });

    it('should throw generic error on db failure', async () => {
      verifier.verify.mockResolvedValueOnce({ sub: 'admin', groups: ['ADMIN'], 'cognito:groups': ['ADMIN'] });
      ddb.send.mockResolvedValueOnce({ Item: { orderId: 'o1', status: 'PAID' } });
      ddb.send.mockRejectedValueOnce(new Error('DB Down'));

      const res = await request(app)
        .patch('/api/v1/orders/o1/status')
        .set('Authorization', 'Bearer admin_token')
        .send({ status: 'PROCESSING', version: 1 });

      expect(res.statusCode).toBe(500);
    });
  });
});
