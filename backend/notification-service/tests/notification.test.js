'use strict';

jest.mock('../config/aws', () => ({ ddbDocClient: { send: jest.fn() } }));
jest.mock('aws-xray-sdk-core', () => ({ captureAWSv3Client: (c) => c }));

// Mock nodemailer so no real emails are sent
jest.mock('nodemailer', () => ({
  createTransport: jest.fn(() => ({
    sendMail: jest.fn().mockResolvedValue({ messageId: 'test-msg-id' }),
  })),
}));

const { ddbDocClient } = require('../config/aws');
const request = require('supertest');
const app = require('../app');

const MOCK_ORDER = { id: 'order-1', userId: 'user-1', totalAmount: 99.99 };
const MOCK_USER  = { id: 'user-1', email: 'user@test.com', firstName: 'Alice' };

beforeEach(() => jest.clearAllMocks());

// ── Notification Service ──────────────────────────────────────────────────────
describe('NotificationService', () => {
  const service = require('../services/notification.service');

  it('processPaymentEvent returns success when order and user found', async () => {
    ddbDocClient.send
      .mockResolvedValueOnce({ Item: MOCK_ORDER })  // getOrder
      .mockResolvedValueOnce({ Item: MOCK_USER });   // getUser
    const result = await service.processPaymentEvent('order-1', 99.99, 'SUCCESS');
    expect(result.success).toBe(true);
  });

  it('processPaymentEvent returns false when order not found', async () => {
    ddbDocClient.send.mockResolvedValueOnce({ Item: undefined });
    const result = await service.processPaymentEvent('missing', 50, 'SUCCESS');
    expect(result.success).toBe(false);
    expect(result.message).toMatch(/order not found/i);
  });

  it('processPaymentEvent returns false when user not found', async () => {
    ddbDocClient.send
      .mockResolvedValueOnce({ Item: MOCK_ORDER })
      .mockResolvedValueOnce({ Item: undefined });
    const result = await service.processPaymentEvent('order-1', 50, 'SUCCESS');
    expect(result.success).toBe(false);
    expect(result.message).toMatch(/user.*not found/i);
  });

  it('processPaymentEvent skips email for FAILED status', async () => {
    ddbDocClient.send
      .mockResolvedValueOnce({ Item: MOCK_ORDER })
      .mockResolvedValueOnce({ Item: MOCK_USER });
    const result = await service.processPaymentEvent('order-1', 99.99, 'FAILED');
    // FAILED status doesn't send email — service logs a warning and returns success
    expect(result.success).toBe(true);
  });
});

// ── SQS Handler ───────────────────────────────────────────────────────────────
describe('SQS Handler (handler.js)', () => {
  const handler = require('../handler');

  it('processes PaymentSuccess event without throwing', async () => {
    ddbDocClient.send
      .mockResolvedValueOnce({ Item: MOCK_ORDER })
      .mockResolvedValueOnce({ Item: MOCK_USER });
    const event = {
      Records: [{
        body: JSON.stringify({
          Message: JSON.stringify({
            eventType: 'PaymentSuccess',
            payload: { orderId: 'order-1', amount: 99.99, status: 'SUCCESS' },
          }),
        }),
      }],
    };
    const result = await handler.processNotificationEvents(event);
    expect(result.statusCode).toBe(200);
  });

  it('processes PaymentFailed event without throwing', async () => {
    ddbDocClient.send
      .mockResolvedValueOnce({ Item: MOCK_ORDER })
      .mockResolvedValueOnce({ Item: MOCK_USER });
    const event = {
      Records: [{
        body: JSON.stringify({
          Message: JSON.stringify({
            eventType: 'PaymentFailed',
            payload: { orderId: 'order-1', amount: 50, status: 'FAILED' },
          }),
        }),
      }],
    };
    const result = await handler.processNotificationEvents(event);
    expect(result.statusCode).toBe(200);
  });

  it('handles malformed JSON body gracefully without throwing', async () => {
    const event = { Records: [{ body: 'NOT_VALID_JSON' }] };
    const result = await handler.processNotificationEvents(event);
    expect(result.statusCode).toBe(200);
  });

  it('handles unknown eventType gracefully', async () => {
    const event = {
      Records: [{
        body: JSON.stringify({
          Message: JSON.stringify({ eventType: 'UnknownEvent', payload: {} }),
        }),
      }],
    };
    const result = await handler.processNotificationEvents(event);
    expect(result.statusCode).toBe(200);
  });
});

// ── API Routes ────────────────────────────────────────────────────────────────
describe('Notification API', () => {
  it('GET /health returns UP', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('UP');
  });

  it('POST /api/v1/notifications/order-confirmation returns 400 on missing fields', async () => {
    const res = await request(app)
      .post('/api/v1/notifications/order-confirmation')
      .send({ email: 'not-enough@test.com' });
    expect(res.status).toBe(400);
  });

  it('POST /api/v1/notifications/payment-confirmation returns 400 on invalid status', async () => {
    const res = await request(app)
      .post('/api/v1/notifications/payment-confirmation')
      .send({ email: 'a@b.com', orderId: 'o1', amount: 10, status: 'INVALID', userName: 'Alice' });
    expect(res.status).toBe(400);
  });
});
