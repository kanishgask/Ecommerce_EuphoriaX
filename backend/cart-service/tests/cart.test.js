'use strict';

// Mock AWS clients before any require
jest.mock('../config/aws', () => ({ ddbDocClient: { send: jest.fn() } }));
jest.mock('aws-xray-sdk-core', () => ({ captureAWSv3Client: (c) => c }));

// Mock auth middleware — inject a fake user so all protected routes pass
jest.mock('../middlewares/auth.middleware', () => ({
  requireAuth: (req, _res, next) => {
    req.user = { sub: 'user-abc' };
    next();
  },
}));

const { ddbDocClient } = require('../config/aws');
const request = require('supertest');
const app = require('../app');

const CART = { userId: 'user-abc', items: [{ productId: 'p1', quantity: 2 }], updatedAt: '2024-01-01T00:00:00.000Z' };

beforeEach(() => jest.clearAllMocks());

// ── Repository Layer ──────────────────────────────────────────────────────────
describe('CartRepository', () => {
  const repo = require('../repositories/cart.repository');

  it('getCart returns item when found', async () => {
    ddbDocClient.send.mockResolvedValueOnce({ Item: CART });
    const result = await repo.getCart('user-abc');
    expect(result).toEqual(CART);
  });

  it('getCart returns empty cart when not found', async () => {
    ddbDocClient.send.mockResolvedValueOnce({ Item: undefined });
    const result = await repo.getCart('new-user');
    expect(result.items).toEqual([]);
    expect(result.userId).toBe('new-user');
  });

  it('saveCart writes to DynamoDB and returns cart', async () => {
    ddbDocClient.send.mockResolvedValueOnce({});
    const result = await repo.saveCart({ ...CART });
    expect(ddbDocClient.send).toHaveBeenCalledTimes(1);
    expect(result.userId).toBe('user-abc');
  });

  it('clearCart calls DeleteCommand', async () => {
    ddbDocClient.send.mockResolvedValueOnce({});
    await repo.clearCart('user-abc');
    expect(ddbDocClient.send).toHaveBeenCalledTimes(1);
  });
});

// ── Service Layer ─────────────────────────────────────────────────────────────
describe('CartService', () => {
  const service = require('../services/cart.service');

  it('getCart delegates to repository', async () => {
    ddbDocClient.send.mockResolvedValueOnce({ Item: CART });
    const result = await service.getCart('user-abc');
    expect(result.items).toHaveLength(1);
  });

  it('addItem increments quantity for existing product', async () => {
    ddbDocClient.send
      .mockResolvedValueOnce({ Item: { ...CART } })  // getCart
      .mockResolvedValueOnce({});                      // saveCart
    const result = await service.addItem('user-abc', 'p1', 3);
    expect(result.items[0].quantity).toBe(5);
  });

  it('addItem pushes new item when product not in cart', async () => {
    ddbDocClient.send
      .mockResolvedValueOnce({ Item: { userId: 'user-abc', items: [], updatedAt: '' } })
      .mockResolvedValueOnce({});
    const result = await service.addItem('user-abc', 'p-new', 1);
    expect(result.items).toHaveLength(1);
    expect(result.items[0].productId).toBe('p-new');
  });

  it('updateQuantity throws 404 when item not in cart', async () => {
    ddbDocClient.send.mockResolvedValueOnce({ Item: { userId: 'u', items: [], updatedAt: '' } });
    await expect(service.updateQuantity('u', 'p-missing', 5)).rejects.toMatchObject({ statusCode: 404 });
  });

  it('removeItem filters item from cart', async () => {
    ddbDocClient.send
      .mockResolvedValueOnce({ Item: { ...CART } })
      .mockResolvedValueOnce({});
    const result = await service.removeItem('user-abc', 'p1');
    expect(result.items).toHaveLength(0);
  });

  it('clearCart returns empty items', async () => {
    ddbDocClient.send.mockResolvedValueOnce({});
    const result = await service.clearCart('user-abc');
    expect(result.items).toEqual([]);
  });
});

// ── API Routes ────────────────────────────────────────────────────────────────
describe('Cart API', () => {
  it('GET /health returns UP', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('UP');
  });

  it('GET /api/v1/cart returns users cart', async () => {
    ddbDocClient.send.mockResolvedValueOnce({ Item: CART });
    const res = await request(app).get('/api/v1/cart').set('Authorization', 'Bearer token');
    expect(res.status).toBe(200);
    expect(res.body.data.userId).toBe('user-abc');
  });

  it('POST /api/v1/cart/items adds item to cart', async () => {
    ddbDocClient.send
      .mockResolvedValueOnce({ Item: { userId: 'user-abc', items: [], updatedAt: '' } })
      .mockResolvedValueOnce({});
    const res = await request(app)
      .post('/api/v1/cart/items')
      .set('Authorization', 'Bearer token')
      .send({ productId: 'p-new', quantity: 2 });
    expect(res.status).toBe(200);
    expect(res.body.data.items[0].productId).toBe('p-new');
  });

  it('POST /api/v1/cart/items returns 400 on validation error', async () => {
    const res = await request(app)
      .post('/api/v1/cart/items')
      .set('Authorization', 'Bearer token')
      .send({ productId: '' }); // missing quantity
    expect(res.status).toBe(400);
  });

  it('DELETE /api/v1/cart clears the cart', async () => {
    ddbDocClient.send.mockResolvedValueOnce({});
    const res = await request(app).delete('/api/v1/cart').set('Authorization', 'Bearer token');
    expect(res.status).toBe(200);
    expect(res.body.data.items).toEqual([]);
  });

  it('DELETE /api/v1/cart/items/:productId removes item', async () => {
    ddbDocClient.send
      .mockResolvedValueOnce({ Item: { ...CART } })
      .mockResolvedValueOnce({});
    const res = await request(app)
      .delete('/api/v1/cart/items/p1')
      .set('Authorization', 'Bearer token');
    expect(res.status).toBe(200);
  });
});
