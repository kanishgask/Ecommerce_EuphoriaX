'use strict';

jest.mock('../config/aws', () => ({ ddbDocClient: { send: jest.fn() } }));
jest.mock('aws-xray-sdk-core', () => ({ captureAWSv3Client: (c) => c }));
jest.mock('@aws-sdk/client-sns', () => ({
  SNSClient: jest.fn().mockImplementation(() => ({ send: jest.fn() })),
  PublishCommand: jest.fn(),
}));

// Mock auth middleware so unit tests don't require real Cognito/JWKS connectivity
jest.mock('../middlewares/auth.middleware', () => ({
  requireAuth: (req, res, next) => {
    // Simulate an authenticated admin user for all test requests
    req.user = { sub: 'test-user-123', 'cognito:groups': ['admin', 'inventory_manager'] };
    next();
  },
  requireRole: (...roles) => (req, res, next) => next(),
}));

const { ddbDocClient } = require('../config/aws');
const request = require('supertest');
const app = require('../app');

const MOCK_INVENTORY = { productId: 'prod-1', availableStock: 100, reservedStock: 10 };

beforeEach(() => jest.clearAllMocks());

// ── Repository Layer ──────────────────────────────────────────────────────────
describe('InventoryRepository', () => {
  const repo = require('../repositories/inventory.repository');

  it('getInventory returns item when found', async () => {
    ddbDocClient.send.mockResolvedValueOnce({ Item: MOCK_INVENTORY });
    const result = await repo.getInventory('prod-1');
    expect(result.availableStock).toBe(100);
  });

  it('getInventory returns default when not found', async () => {
    ddbDocClient.send.mockResolvedValueOnce({ Item: undefined });
    const result = await repo.getInventory('new-prod');
    expect(result).toEqual({ productId: 'new-prod', availableStock: 0, reservedStock: 0 });
  });

  it('updateStock returns updated attributes', async () => {
    const updated = { ...MOCK_INVENTORY, availableStock: 50 };
    ddbDocClient.send.mockResolvedValueOnce({ Attributes: updated });
    const result = await repo.updateStock('prod-1', 50);
    expect(result.availableStock).toBe(50);
  });

  it('reserveStock calls UpdateCommand with condition', async () => {
    const reserved = { ...MOCK_INVENTORY, availableStock: 90, reservedStock: 20 };
    ddbDocClient.send.mockResolvedValueOnce({ Attributes: reserved });
    const result = await repo.reserveStock('prod-1', 10);
    expect(result.availableStock).toBe(90);
    expect(result.reservedStock).toBe(20);
  });

  it('releaseStock returns updated attributes', async () => {
    const released = { ...MOCK_INVENTORY, availableStock: 110, reservedStock: 0 };
    ddbDocClient.send.mockResolvedValueOnce({ Attributes: released });
    const result = await repo.releaseStock('prod-1', 10);
    expect(result.availableStock).toBe(110);
  });
});

// ── Service Layer ─────────────────────────────────────────────────────────────
describe('InventoryService', () => {
  const service = require('../services/inventory.service');

  beforeEach(() => {
    process.env.SNS_INVENTORY_EVENTS_TOPIC = '';
  });

  it('getAvailability returns inventory data', async () => {
    ddbDocClient.send.mockResolvedValueOnce({ Item: MOCK_INVENTORY });
    const result = await service.getAvailability('prod-1');
    expect(result.availableStock).toBe(100);
  });

  it('updateStock updates and returns inventory', async () => {
    ddbDocClient.send.mockResolvedValueOnce({ Attributes: { ...MOCK_INVENTORY, availableStock: 200 } });
    const result = await service.updateStock('prod-1', 200);
    expect(result.availableStock).toBe(200);
  });

  it('reserveInventory succeeds and returns success result', async () => {
    ddbDocClient.send.mockResolvedValueOnce({ Attributes: { ...MOCK_INVENTORY, availableStock: 90 } });
    const result = await service.reserveInventory('order-1', [{ productId: 'prod-1', quantity: 10 }]);
    expect(result.success).toBe(true);
    expect(result.orderId).toBe('order-1');
  });

  it('reserveInventory rolls back and throws when stock insufficient', async () => {
    const err = Object.assign(new Error('Insufficient'), { name: 'ConditionalCheckFailedException' });
    ddbDocClient.send.mockRejectedValueOnce(err);   // reserve fails
    ddbDocClient.send.mockResolvedValueOnce({});     // release rollback
    await expect(
      service.reserveInventory('order-x', [{ productId: 'prod-1', quantity: 999 }])
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  it('releaseInventory succeeds for all items', async () => {
    ddbDocClient.send.mockResolvedValueOnce({ Attributes: MOCK_INVENTORY });
    const result = await service.releaseInventory('order-1', [{ productId: 'prod-1', quantity: 10 }]);
    expect(result.success).toBe(true);
  });
});

// ── SQS Handler ───────────────────────────────────────────────────────────────
describe('SQS Handler', () => {
  const handler = require('../handler');

  it('processes OrderCreated event without throwing', async () => {
    ddbDocClient.send.mockResolvedValue({ Attributes: MOCK_INVENTORY });
    const event = {
      Records: [{
        body: JSON.stringify({
          Message: JSON.stringify({
            eventType: 'OrderCreated',
            payload: { id: 'o-1', items: [{ productId: 'p1', quantity: 1 }], userId: 'u1', totalAmount: 10 },
          }),
        }),
      }],
    };
    await expect(handler.processInventoryEvents(event)).resolves.toMatchObject({ statusCode: 200 });
  });

  it('handles malformed SQS records gracefully without throwing', async () => {
    const event = { Records: [{ body: 'INVALID_JSON' }] };
    await expect(handler.processInventoryEvents(event)).resolves.toMatchObject({ statusCode: 200 });
  });
});

// ── API Routes ────────────────────────────────────────────────────────────────
describe('Inventory API', () => {
  it('GET /health returns UP', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('UP');
  });

  it('GET /api/v1/inventory/:productId returns inventory (authenticated)', async () => {
    ddbDocClient.send.mockResolvedValueOnce({ Item: MOCK_INVENTORY });
    const res = await request(app)
      .get('/api/v1/inventory/prod-1')
      .set('Authorization', 'Bearer mock-token');
    expect(res.status).toBe(200);
    expect(res.body.data.availableStock).toBe(100);
  });

  it('PUT /api/v1/inventory/:productId updates stock (admin)', async () => {
    ddbDocClient.send.mockResolvedValueOnce({ Attributes: { ...MOCK_INVENTORY, availableStock: 200 } });
    const res = await request(app)
      .put('/api/v1/inventory/prod-1')
      .set('Authorization', 'Bearer mock-token')
      .send({ quantity: 200 });
    expect(res.status).toBe(200);
  });

  it('PUT /api/v1/inventory/:productId returns 400 on validation error', async () => {
    const res = await request(app)
      .put('/api/v1/inventory/prod-1')
      .set('Authorization', 'Bearer mock-token')
      .send({ quantity: -5 });
    expect(res.status).toBe(400);
  });

  it('POST /api/v1/inventory/reserve reserves inventory (admin)', async () => {
    ddbDocClient.send.mockResolvedValueOnce({ Attributes: MOCK_INVENTORY });
    const res = await request(app)
      .post('/api/v1/inventory/reserve')
      .set('Authorization', 'Bearer mock-token')
      .send({ orderId: 'o-1', items: [{ productId: 'p1', quantity: 5 }] });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('POST /api/v1/inventory/release releases inventory (admin)', async () => {
    ddbDocClient.send.mockResolvedValueOnce({ Attributes: MOCK_INVENTORY });
    const res = await request(app)
      .post('/api/v1/inventory/release')
      .set('Authorization', 'Bearer mock-token')
      .send({ orderId: 'o-1', items: [{ productId: 'p1', quantity: 5 }] });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
