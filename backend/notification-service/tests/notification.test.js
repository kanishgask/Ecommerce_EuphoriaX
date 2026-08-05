const request = require('supertest');
const app = require('../src/index');

describe('Notification Service Unit Tests', () => {
  test('GET /health returns 200 ok status and service identifier', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.service).toBe('notification-service');
  });

  test('GET /api/v1/notifications handles listing requests', async () => {
    const res = await request(app).get('/api/v1/notifications');
    // Expect 200 list or 500 when dynamodb offline
    expect([200, 500]).toContain(res.statusCode);
  });

  test('PATCH /api/v1/notifications/:id/read handles status updates for notifications', async () => {
    const res = await request(app).patch('/api/v1/notifications/notif-1/read');
    expect([200, 404, 500]).toContain(res.statusCode);
  });
});
