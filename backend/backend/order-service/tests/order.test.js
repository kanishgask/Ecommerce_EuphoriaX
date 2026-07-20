const request = require('supertest');
const app = require('../src/index');

describe('Order Service', () => {
  test('GET /health returns ok', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
  });

  test('POST /api/v1/orders/checkout requires auth', async () => {
    const res = await request(app).post('/api/v1/orders/checkout').send({});
    expect(res.statusCode).toBe(401);
  });

  test('GET /api/v1/orders/mine requires auth', async () => {
    const res = await request(app).get('/api/v1/orders/mine');
    expect(res.statusCode).toBe(401);
  });
});
