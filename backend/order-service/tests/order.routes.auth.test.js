'use strict';
/**
 * order.routes.auth.test.js
 * 
 * Integration tests for role-based access control on order routes.
 * Tests that PATCH /:id/status and GET /all enforce the 'admin' role,
 * returning 403 for regular authenticated users and 200 for admins.
 */

jest.mock('../config/aws', () => ({ ddbDocClient: { send: jest.fn() } }));
jest.mock('aws-xray-sdk-core', () => ({ captureAWSv3Client: (c) => c }));
jest.mock('@aws-sdk/client-sns', () => ({
  SNSClient: jest.fn().mockImplementation(() => ({ send: jest.fn() })),
  PublishCommand: jest.fn(),
}));

// Mock auth middleware — avoids loading jwks-rsa ESM in Jest environment.
// We expose two helpers: one that injects a regular user, one that injects an admin.
let mockUserGroups = [];
jest.mock('../middlewares/auth.middleware', () => ({
  requireAuth: (req, res, next) => {
    req.user = { sub: 'test-user-123', 'cognito:groups': mockUserGroups };
    next();
  },
  requireRole: (...roles) => (req, res, next) => {
    const userGroups = req.user?.['cognito:groups'] || [];
    const hasRole = roles.some(role => userGroups.includes(role));
    if (!hasRole) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: requires one of these roles [${roles.join(', ')}]`
      });
    }
    next();
  },
}));

// Mock validators so RBAC tests don't depend on Joi schema correctness
jest.mock('../validators/order.validator', () => ({
  createOrderSchema: { validateAsync: jest.fn().mockImplementation(v => Promise.resolve(v)) },
  updateOrderStatusSchema: { validateAsync: jest.fn().mockImplementation(v => Promise.resolve(v)) },
}));

// Mock the service layer so no real DynamoDB calls are made
jest.mock('../services/order.service', () => ({
  createOrder: jest.fn().mockResolvedValue({ id: 'order-new' }),
  getOrderById: jest.fn().mockResolvedValue({ id: 'order-1', userId: 'test-user-123' }),
  getUserOrders: jest.fn().mockResolvedValue([]),
  updateOrderStatus: jest.fn().mockResolvedValue({ id: 'order-1', status: 'SHIPPED' }),
  getAllOrders: jest.fn().mockResolvedValue([{ id: 'order-1' }, { id: 'order-2' }]),
}));

const request = require('supertest');
const app = require('../app');
const orderService = require('../services/order.service');

beforeEach(() => {
  jest.clearAllMocks();
  mockUserGroups = []; // Default: regular user with no groups
});

// ── Role-Based Access Control: PATCH /:id/status ─────────────────────────────
describe('PATCH /api/v1/orders/:id/status — admin role required', () => {
  it('should return 403 for an authenticated non-admin user', async () => {
    mockUserGroups = []; // Regular user, no groups

    const res = await request(app)
      .patch('/api/v1/orders/order-1/status')
      .set('Authorization', 'Bearer mock-token')
      .send({ status: 'SHIPPED' });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/Forbidden/i);
    // Controller must NOT have been called
    expect(orderService.updateOrderStatus).not.toHaveBeenCalled();
  });

  it('should return 403 for a user with an unrelated group (e.g. inventory_manager)', async () => {
    mockUserGroups = ['inventory_manager'];

    const res = await request(app)
      .patch('/api/v1/orders/order-1/status')
      .set('Authorization', 'Bearer mock-token')
      .send({ status: 'SHIPPED' });

    expect(res.status).toBe(403);
    expect(orderService.updateOrderStatus).not.toHaveBeenCalled();
  });

  it('should return 200 for an authenticated admin user', async () => {
    mockUserGroups = ['admin'];

    const res = await request(app)
      .patch('/api/v1/orders/order-1/status')
      .set('Authorization', 'Bearer mock-token')
      .send({ status: 'SHIPPED' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(orderService.updateOrderStatus).toHaveBeenCalledWith('order-1', 'SHIPPED');
  });
});

// ── Role-Based Access Control: GET /all ──────────────────────────────────────
describe('GET /api/v1/orders/all — admin role required', () => {
  it('should return 403 for an authenticated non-admin user', async () => {
    mockUserGroups = []; // Regular user, no groups

    const res = await request(app)
      .get('/api/v1/orders/all')
      .set('Authorization', 'Bearer mock-token');

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/Forbidden/i);
    expect(orderService.getAllOrders).not.toHaveBeenCalled();
  });

  it('should return 200 and all orders for an authenticated admin user', async () => {
    mockUserGroups = ['admin'];

    const res = await request(app)
      .get('/api/v1/orders/all')
      .set('Authorization', 'Bearer mock-token');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(orderService.getAllOrders).toHaveBeenCalled();
  });
});

// ── Non-Admin Routes: Still Accessible by Regular Users ───────────────────────
describe('Regular user routes — accessible without admin role', () => {
  it('GET /api/v1/orders — should return 200 for any authenticated user', async () => {
    mockUserGroups = []; // Regular user

    const res = await request(app)
      .get('/api/v1/orders')
      .set('Authorization', 'Bearer mock-token');

    expect(res.status).toBe(200);
    expect(orderService.getUserOrders).toHaveBeenCalledWith('test-user-123');
  });

  it('POST /api/v1/orders — should return 201 for any authenticated user', async () => {
    mockUserGroups = []; // Regular user

    const res = await request(app)
      .post('/api/v1/orders')
      .set('Authorization', 'Bearer mock-token')
      .send({ items: [{ productId: 'p1', quantity: 1 }], shippingAddress: '123 Main St' });

    expect(res.status).toBe(201);
    expect(orderService.createOrder).toHaveBeenCalledWith('test-user-123', expect.any(Object));
  });
});
