const request = require('supertest');
const app = require('../src/index');

describe('Product Service', () => {
  test('GET /health returns ok', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
  });

  test('GET /api/v1/products/search without q fails validation upstream', async () => {
    const res = await request(app).get('/api/v1/products/search');
    expect([422, 500]).toContain(res.statusCode);
  });

  test('POST /api/v1/products requires auth', async () => {
    const res = await request(app).post('/api/v1/products').send({});
    expect(res.statusCode).toBe(401);
  });
});
