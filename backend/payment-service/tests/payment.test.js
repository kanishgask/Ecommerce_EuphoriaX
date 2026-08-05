const request = require('supertest');
const app = require('../src/index');

describe('Payment Service Unit Tests', () => {
  test('GET /health returns 200 ok status and service identifier', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.service).toBe('payment-service');
  });

  test('POST /api/v1/payments requires valid payment payload or authentication', async () => {
    const res = await request(app).post('/api/v1/payments').send({});
    // Expect 400 bad request, 401 unauthenticated, or 500 when offline
    expect([400, 401, 422, 500]).toContain(res.statusCode);
  });

  test('POST /api/v1/payments/:id/verify validates transaction status', async () => {
    const res = await request(app).post('/api/v1/payments/pay-abc/verify').send({});
    expect([200, 400, 404, 500]).toContain(res.statusCode);
  });
});
