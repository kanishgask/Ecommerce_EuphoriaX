const request = require('supertest');
const app = require('../src/index');

describe('Cart Service', () => {
  test('GET /health returns ok', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
  });

  test('GET /api/v1/cart requires auth', async () => {
    const res = await request(app).get('/api/v1/cart');
    expect(res.statusCode).toBe(401);
  });

  test('POST /api/v1/cart/items requires auth', async () => {
    const res = await request(app).post('/api/v1/cart/items').send({ productId: 'abc', quantity: 1 });
    expect(res.statusCode).toBe(401);
  });
});
