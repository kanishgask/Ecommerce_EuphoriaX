const request = require('supertest');
const app = require('../src/index');

describe('Auth Service', () => {
  test('GET /health returns ok', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  test('POST /api/v1/auth/register rejects invalid payload', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ email: 'not-an-email', password: '123' });
    expect(res.statusCode).toBe(422);
    expect(res.body.success).toBe(false);
  });

  test('POST /api/v1/auth/login rejects missing password', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'user@example.com' });
    expect(res.statusCode).toBe(422);
  });
});
