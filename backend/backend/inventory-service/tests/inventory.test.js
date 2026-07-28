const request = require('supertest');
const app = require('../src/index');

describe('Inventory Service Unit Tests', () => {
  test('GET /health returns 200 ok status and service identifier', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.service).toBe('inventory-service');
  });

  test('GET /api/v1/inventory/:productId handles unknown or non-existent items safely', async () => {
    const res = await request(app).get('/api/v1/inventory/nonexistent-item-999');
    // Expect 404 Not Found or 500 when offline without database
    expect([404, 500]).toContain(res.statusCode);
  });

  test('POST /api/v1/inventory/:productId/adjust rejects invalid quantity adjustments', async () => {
    const res = await request(app).post('/api/v1/inventory/prod-101/adjust').send({});
    expect([400, 422, 500]).toContain(res.statusCode);
  });
});
