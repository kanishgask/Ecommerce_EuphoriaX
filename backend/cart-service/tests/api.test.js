const request = require('supertest');
const app = require('../src/index');
const { CognitoJwtVerifier } = require('aws-jwt-verify');
const { DynamoDBDocumentClient } = require('@aws-sdk/lib-dynamodb');
const axios = require('axios');

jest.mock('aws-jwt-verify', () => ({
  CognitoJwtVerifier: {
    create: jest.fn().mockReturnValue({
      verify: jest.fn()
    })
  }
}));

jest.mock('@aws-sdk/lib-dynamodb', () => {
  const original = jest.requireActual('@aws-sdk/lib-dynamodb');
  return {
    ...original,
    DynamoDBDocumentClient: {
      from: jest.fn().mockReturnValue({
        send: jest.fn()
      })
    },
    GetCommand: jest.fn(),
    QueryCommand: jest.fn(),
    PutCommand: jest.fn(),
    UpdateCommand: jest.fn(),
    DeleteCommand: jest.fn(),
    BatchWriteCommand: jest.fn()
  };
});

jest.mock('axios');

const ddb = require('../src/utils/dynamoClient');
const verifier = CognitoJwtVerifier.create();

describe('Cart Service API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/v1/cart', () => {
    it('should return empty cart if no items exist', async () => {
      verifier.verify.mockResolvedValueOnce({ sub: 'user1' });
      ddb.send.mockResolvedValueOnce({ Items: [] });

      const res = await request(app)
        .get('/api/v1/cart')
        .set('Authorization', 'Bearer valid_token');

      expect(res.statusCode).toBe(200);
      expect(res.body.data.items.length).toBe(0);
      expect(res.body.data.itemCount).toBe(0);
      expect(res.body.data.subtotal).toBe(0);
    });

    it('should calculate subtotal correctly when items exist', async () => {
      verifier.verify.mockResolvedValueOnce({ sub: 'user1' });
      ddb.send.mockResolvedValueOnce({
        Items: [
          { productId: 'p1', price: 10, quantity: 2 },
          { productId: 'p2', price: 15.5, quantity: 1 }
        ]
      });

      const res = await request(app)
        .get('/api/v1/cart')
        .set('Authorization', 'Bearer valid_token');

      expect(res.statusCode).toBe(200);
      expect(res.body.data.itemCount).toBe(3);
      expect(res.body.data.subtotal).toBe(35.5);
    });
  });

  describe('POST /api/v1/cart/items', () => {
    it('should increment quantity if item already in cart', async () => {
      verifier.verify.mockResolvedValueOnce({ sub: 'user1' });
      ddb.send.mockResolvedValueOnce({ Item: { productId: 'p1', quantity: 2 } }); // getItem returns existing
      ddb.send.mockResolvedValueOnce({ Attributes: { quantity: 3 } }); // updateQuantity returns new attr

      const res = await request(app)
        .post('/api/v1/cart/items')
        .set('Authorization', 'Bearer token')
        .send({ productId: 'p1', quantity: 1 });

      expect(res.statusCode).toBe(201);
      expect(res.body.data.quantity).toBe(3);
    });

    it('should fetch product and add new item if not in cart', async () => {
      verifier.verify.mockResolvedValueOnce({ sub: 'user1' });
      ddb.send.mockResolvedValueOnce({ Item: null }); // not in cart
      
      axios.get.mockResolvedValueOnce({
        data: { data: { name: 'New Phone', price: 500, currency: 'USD', status: 'ACTIVE', images: ['img.jpg'] } }
      });
      ddb.send.mockResolvedValueOnce({}); // putItem succeeds

      const res = await request(app)
        .post('/api/v1/cart/items')
        .set('Authorization', 'Bearer token')
        .send({ productId: 'p1', quantity: 1 });

      expect(res.statusCode).toBe(201);
      expect(res.body.data.name).toBe('New Phone');
      expect(res.body.data.price).toBe(500);
      expect(res.body.data.quantity).toBe(1);
    });

    it('should return 422 if product is inactive', async () => {
      verifier.verify.mockResolvedValueOnce({ sub: 'user1' });
      ddb.send.mockResolvedValueOnce({ Item: null });
      axios.get.mockResolvedValueOnce({
        data: { data: { name: 'Old Phone', status: 'INACTIVE' } }
      });

      const res = await request(app)
        .post('/api/v1/cart/items')
        .set('Authorization', 'Bearer token')
        .send({ productId: 'p1', quantity: 1 });

      expect(res.statusCode).toBe(422);
      expect(res.body.message).toBe('Product is not available for purchase');
    });

    it('should return 404 if product not found remotely', async () => {
      verifier.verify.mockResolvedValueOnce({ sub: 'user1' });
      ddb.send.mockResolvedValueOnce({ Item: null });
      axios.get.mockRejectedValueOnce({ response: { status: 404 } });

      const res = await request(app)
        .post('/api/v1/cart/items')
        .set('Authorization', 'Bearer token')
        .send({ productId: 'p1', quantity: 1 });

      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe('Product not found');
    });

    it('should return 502 if product service fails', async () => {
      verifier.verify.mockResolvedValueOnce({ sub: 'user1' });
      ddb.send.mockResolvedValueOnce({ Item: null });
      axios.get.mockRejectedValueOnce(new Error('Network error'));

      const res = await request(app)
        .post('/api/v1/cart/items')
        .set('Authorization', 'Bearer token')
        .send({ productId: 'p1', quantity: 1 });

      expect(res.statusCode).toBe(502);
      expect(res.body.message).toBe('Unable to reach product service');
    });
  });

  describe('PATCH /api/v1/cart/items/:productId', () => {
    it('should update quantity if item exists', async () => {
      verifier.verify.mockResolvedValueOnce({ sub: 'user1' });
      ddb.send.mockResolvedValueOnce({ Attributes: { quantity: 5 } });

      const res = await request(app)
        .patch('/api/v1/cart/items/p1')
        .set('Authorization', 'Bearer token')
        .send({ quantity: 5 });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.quantity).toBe(5);
    });

    it('should return 404 if item not in cart', async () => {
      verifier.verify.mockResolvedValueOnce({ sub: 'user1' });
      const conflictError = new Error('Conflict');
      conflictError.name = 'ConditionalCheckFailedException';
      ddb.send.mockRejectedValueOnce(conflictError);

      const res = await request(app)
        .patch('/api/v1/cart/items/p1')
        .set('Authorization', 'Bearer token')
        .send({ quantity: 5 });

      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe('Item is not in the cart');
    });

    it('should return generic error if DB fails', async () => {
      verifier.verify.mockResolvedValueOnce({ sub: 'user1' });
      ddb.send.mockRejectedValueOnce(new Error('DB Down'));

      const res = await request(app)
        .patch('/api/v1/cart/items/p1')
        .set('Authorization', 'Bearer token')
        .send({ quantity: 5 });

      expect(res.statusCode).toBe(500);
    });
  });

  describe('DELETE /api/v1/cart/items/:productId', () => {
    it('should remove an item', async () => {
      verifier.verify.mockResolvedValueOnce({ sub: 'user1' });
      ddb.send.mockResolvedValueOnce({}); // success

      const res = await request(app)
        .delete('/api/v1/cart/items/p1')
        .set('Authorization', 'Bearer token');

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Item removed from cart');
    });
  });

  describe('Validation Errors', () => {
    it('should return 422 if invalid data is sent', async () => {
      verifier.verify.mockResolvedValueOnce({ sub: 'user1' });

      const res = await request(app)
        .post('/api/v1/cart/items')
        .set('Authorization', 'Bearer token')
        .send({ productId: 'p1', quantity: -5 }); // invalid quantity

      expect(res.statusCode).toBe(422);
      expect(res.body.message).toContain('Validation');
    });
  });

  describe('DELETE /api/v1/cart', () => {
    it('should succeed directly if cart is empty', async () => {
      verifier.verify.mockResolvedValueOnce({ sub: 'user1' });
      ddb.send.mockResolvedValueOnce({ Items: [] }); // getCart empty

      const res = await request(app)
        .delete('/api/v1/cart')
        .set('Authorization', 'Bearer token');

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Cart cleared');
    });

    it('should batch delete if cart has items', async () => {
      verifier.verify.mockResolvedValueOnce({ sub: 'user1' });
      ddb.send.mockResolvedValueOnce({
        Items: Array(30).fill(0).map((_, i) => ({ userId: 'u1', productId: `p${i}` }))
      }); // getCart returns 30 items
      
      ddb.send.mockResolvedValue({}); // BatchWriteCommand 1
      ddb.send.mockResolvedValue({}); // BatchWriteCommand 2

      const res = await request(app)
        .delete('/api/v1/cart')
        .set('Authorization', 'Bearer token');

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Cart cleared');
    });
  });
});
