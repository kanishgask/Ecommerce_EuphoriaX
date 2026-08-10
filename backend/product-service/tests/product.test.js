'use strict';

jest.mock('../config/aws', () => ({
  ddbDocClient: { send: jest.fn() },
}));
jest.mock('aws-xray-sdk-core', () => ({
  captureAWSv3Client: (client) => client,
}));

// Mock auth middleware — avoids loading jwks-rsa ESM in Jest environment
jest.mock('../middlewares/auth.middleware', () => ({
  requireAuth: (req, res, next) => {
    req.user = { sub: 'test-user-123', 'cognito:groups': ['admin'] };
    next();
  },
  requireRole: (...roles) => (req, res, next) => next(),
}));

const { ddbDocClient } = require('../config/aws');
const request = require('supertest');
const app = require('../app');


const MOCK_PRODUCT = {
  id: 'prod-123',
  name: 'Test Sneakers',
  description: 'High quality sneakers',
  price: 99.99,
  category: 'footwear',
  stock: 50,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

beforeEach(() => jest.clearAllMocks());

// ── Repository Layer ──────────────────────────────────────────────────────────
describe('ProductRepository', () => {
  const repo = require('../repositories/product.repository');

  it('createProduct saves and returns product', async () => {
    ddbDocClient.send.mockResolvedValueOnce({});
    const result = await repo.createProduct(MOCK_PRODUCT);
    expect(result).toEqual(MOCK_PRODUCT);
    expect(ddbDocClient.send).toHaveBeenCalledTimes(1);
  });

  it('getProductById returns item when found', async () => {
    ddbDocClient.send.mockResolvedValueOnce({ Item: MOCK_PRODUCT });
    const result = await repo.getProductById('prod-123');
    expect(result).toEqual(MOCK_PRODUCT);
  });

  it('getProductById returns undefined when not found', async () => {
    ddbDocClient.send.mockResolvedValueOnce({ Item: undefined });
    const result = await repo.getProductById('missing');
    expect(result).toBeUndefined();
  });

  it('deleteProduct calls DynamoDB', async () => {
    ddbDocClient.send.mockResolvedValueOnce({});
    await repo.deleteProduct('prod-123');
    expect(ddbDocClient.send).toHaveBeenCalledTimes(1);
  });

  it('getAllProducts returns items', async () => {
    ddbDocClient.send.mockResolvedValueOnce({ Items: [MOCK_PRODUCT], LastEvaluatedKey: null });
    const result = await repo.getAllProducts({}, 20, null);
    expect(result.items).toHaveLength(1);
    expect(result.lastEvaluatedKey).toBeNull();
  });

  it('getAllProducts returns empty array when no items', async () => {
    ddbDocClient.send.mockResolvedValueOnce({ Items: undefined });
    const result = await repo.getAllProducts();
    expect(result.items).toEqual([]);
  });
});

// ── Service Layer ─────────────────────────────────────────────────────────────
describe('ProductService', () => {
  const service = require('../services/product.service');

  it('createProduct generates UUID and timestamps', async () => {
    ddbDocClient.send.mockResolvedValueOnce({});
    const result = await service.createProduct({
      name: 'Sneakers', description: 'Nice', price: 50, category: 'shoes', stock: 10,
    });
    expect(result.id).toBeDefined();
    expect(result.createdAt).toBeDefined();
    expect(result.name).toBe('Sneakers');
  });

  it('getProductById throws 404 when not found', async () => {
    ddbDocClient.send.mockResolvedValueOnce({ Item: undefined });
    await expect(service.getProductById('ghost')).rejects.toMatchObject({ statusCode: 404 });
  });

  it('getProductById returns product when found', async () => {
    ddbDocClient.send.mockResolvedValueOnce({ Item: MOCK_PRODUCT });
    const result = await service.getProductById('prod-123');
    expect(result).toEqual(MOCK_PRODUCT);
  });

  it('deleteProduct throws 404 when product missing', async () => {
    ddbDocClient.send.mockResolvedValueOnce({ Item: undefined });
    await expect(service.deleteProduct('ghost')).rejects.toMatchObject({ statusCode: 404 });
  });

  it('searchProducts filters by query text', async () => {
    ddbDocClient.send.mockResolvedValueOnce({
      Items: [MOCK_PRODUCT, { ...MOCK_PRODUCT, id: 'p2', name: 'Hat', description: 'Cool hat' }],
    });
    const result = await service.searchProducts({ query: 'sneaker' }, 20, null);
    expect(result.items).toHaveLength(1);
    expect(result.items[0].name).toBe('Test Sneakers');
  });
});

// ── API Routes ────────────────────────────────────────────────────────────────
describe('Product API', () => {
  it('GET /health returns UP', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('UP');
  });

  it('GET /api/v1/products returns product list', async () => {
    ddbDocClient.send.mockResolvedValueOnce({ Items: [MOCK_PRODUCT] });
    const res = await request(app).get('/api/v1/products');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
  });

  it('GET /api/v1/products/:id returns 200', async () => {
    ddbDocClient.send.mockResolvedValueOnce({ Item: MOCK_PRODUCT });
    const res = await request(app).get('/api/v1/products/prod-123');
    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe('Test Sneakers');
  });

  it('GET /api/v1/products/:id returns 404 when not found', async () => {
    ddbDocClient.send.mockResolvedValueOnce({ Item: undefined });
    const res = await request(app).get('/api/v1/products/missing');
    expect(res.status).toBe(404);
  });

  it('POST /api/v1/products creates a product', async () => {
    ddbDocClient.send.mockResolvedValueOnce({});
    const res = await request(app).post('/api/v1/products').send({
      name: 'Cool Sneakers', description: 'Very comfortable sneakers', price: 59.99,
      category: 'footwear', stock: 100,
    });
    expect(res.status).toBe(201);
    expect(res.body.data.name).toBe('Cool Sneakers');
  });

  it('POST /api/v1/products returns 400 on validation failure', async () => {
    const res = await request(app).post('/api/v1/products').send({ name: 'X' }); // missing required fields
    expect(res.status).toBe(400);
  });

  it('DELETE /api/v1/products/:id returns 200', async () => {
    ddbDocClient.send
      .mockResolvedValueOnce({ Item: MOCK_PRODUCT }) // getProductById check
      .mockResolvedValueOnce({});                    // deleteProduct
    const res = await request(app).delete('/api/v1/products/prod-123');
    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/deleted/i);
  });

  it('DELETE /api/v1/products/:id returns 404 when product missing', async () => {
    ddbDocClient.send.mockResolvedValueOnce({ Item: undefined });
    const res = await request(app).delete('/api/v1/products/ghost');
    expect(res.status).toBe(404);
  });
});
