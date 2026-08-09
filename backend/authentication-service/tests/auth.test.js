'use strict';

// Mock AWS before any require
jest.mock('../config/aws', () => ({
  ddbDocClient: { send: jest.fn() },
  cognitoClient: { send: jest.fn() },
}));
jest.mock('aws-xray-sdk-core', () => ({ captureAWSv3Client: (c) => c }));

// Mock jwks-rsa and jsonwebtoken for auth middleware
jest.mock('jwks-rsa', () => () => ({
  getSigningKey: (_kid, cb) => cb(null, { publicKey: 'test-key' }),
}));
jest.mock('jsonwebtoken', () => ({
  verify: (_token, _getKey, _opts, cb) => cb(null, { sub: 'user-123' }),
}));

const { ddbDocClient, cognitoClient } = require('../config/aws');
const request = require('supertest');
const app = require('../app');

const MOCK_USER = {
  id: 'user-123',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  createdAt: '2024-01-01T00:00:00.000Z',
};

beforeEach(() => jest.clearAllMocks());

// ── User Repository ───────────────────────────────────────────────────────────
describe('UserRepository', () => {
  const repo = require('../repositories/user.repository');

  it('createUser saves user and returns item', async () => {
    ddbDocClient.send.mockResolvedValueOnce({});
    const result = await repo.createUser(MOCK_USER);
    expect(result.email).toBe('test@example.com');
  });

  it('getUserById returns user when found', async () => {
    ddbDocClient.send.mockResolvedValueOnce({ Item: MOCK_USER });
    const result = await repo.getUserById('user-123');
    expect(result).toEqual(MOCK_USER);
  });

  it('getUserById returns undefined when not found', async () => {
    ddbDocClient.send.mockResolvedValueOnce({ Item: undefined });
    const result = await repo.getUserById('ghost');
    expect(result).toBeUndefined();
  });

  it('getAllUsers returns array of users', async () => {
    ddbDocClient.send.mockResolvedValueOnce({ Items: [MOCK_USER] });
    const result = await repo.getAllUsers();
    expect(result).toHaveLength(1);
  });

  it('getAllUsers returns empty array on error', async () => {
    ddbDocClient.send.mockRejectedValueOnce(new Error('DynamoDB Error'));
    const result = await repo.getAllUsers();
    expect(result).toEqual([]);
  });
});

// ── Cognito Service ───────────────────────────────────────────────────────────
describe('CognitoService', () => {
  const cognito = require('../services/cognito.service');

  it('signUp returns UserSub', async () => {
    cognitoClient.send.mockResolvedValueOnce({ UserSub: 'user-sub-abc' });
    const result = await cognito.signUp('a@b.com', 'Pass123!', 'A', 'B');
    expect(result).toBe('user-sub-abc');
  });

  it('login returns tokens', async () => {
    cognitoClient.send.mockResolvedValueOnce({
      AuthenticationResult: { AccessToken: 'acc', IdToken: 'id', RefreshToken: 'ref' },
    });
    const result = await cognito.login('a@b.com', 'Pass123!');
    expect(result.accessToken).toBe('acc');
    expect(result.idToken).toBe('id');
  });

  it('confirmSignUp calls Cognito', async () => {
    cognitoClient.send.mockResolvedValueOnce({});
    await expect(cognito.confirmSignUp('a@b.com', '123456')).resolves.not.toThrow();
  });

  it('forgotPassword calls Cognito', async () => {
    cognitoClient.send.mockResolvedValueOnce({});
    await expect(cognito.forgotPassword('a@b.com')).resolves.not.toThrow();
  });

  it('resetPassword calls Cognito', async () => {
    cognitoClient.send.mockResolvedValueOnce({});
    await expect(cognito.resetPassword('a@b.com', '123456', 'NewPass1!')).resolves.not.toThrow();
  });
});

// ── Auth Service ──────────────────────────────────────────────────────────────
describe('AuthService', () => {
  const service = require('../services/auth.service');

  it('register signs up with Cognito and stores in DynamoDB', async () => {
    cognitoClient.send.mockResolvedValueOnce({ UserSub: 'user-new' });
    ddbDocClient.send.mockResolvedValueOnce({});
    const result = await service.register({
      email: 'new@test.com', password: 'Pass1!', firstName: 'New', lastName: 'User',
    });
    expect(result.email).toBe('new@test.com');
    expect(result.id).toBe('user-new');
  });

  it('getProfile throws 404 when user not found', async () => {
    ddbDocClient.send.mockResolvedValueOnce({ Item: undefined });
    await expect(service.getProfile('ghost')).rejects.toMatchObject({ statusCode: 404 });
  });

  it('getProfile returns user when found', async () => {
    ddbDocClient.send.mockResolvedValueOnce({ Item: MOCK_USER });
    const result = await service.getProfile('user-123');
    expect(result.email).toBe('test@example.com');
  });

  it('getAllUsers delegates to repository', async () => {
    ddbDocClient.send.mockResolvedValueOnce({ Items: [MOCK_USER] });
    const result = await service.getAllUsers();
    expect(result).toHaveLength(1);
  });
});

// ── API Routes ────────────────────────────────────────────────────────────────
describe('Auth API', () => {
  it('GET /health returns UP', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('UP');
  });

  it('POST /api/v1/auth/register returns 201 on success', async () => {
    cognitoClient.send.mockResolvedValueOnce({ UserSub: 'new-sub' });
    ddbDocClient.send.mockResolvedValueOnce({});
    const res = await request(app).post('/api/v1/auth/register').send({
      email: 'reg@test.com', password: 'Abcdef1!', firstName: 'Reg', lastName: 'User',
    });
    expect(res.status).toBe(201);
    expect(res.body.data.email).toBe('reg@test.com');
  });

  it('POST /api/v1/auth/register returns 400 on validation failure', async () => {
    const res = await request(app).post('/api/v1/auth/register').send({ email: 'bad' });
    expect(res.status).toBe(400);
  });

  it('POST /api/v1/auth/login returns 200 with tokens', async () => {
    cognitoClient.send.mockResolvedValueOnce({
      AuthenticationResult: { AccessToken: 'acc', IdToken: 'id', RefreshToken: 'ref' },
    });
    const res = await request(app).post('/api/v1/auth/login').send({
      email: 'test@example.com', password: 'Pass1!',
    });
    expect(res.status).toBe(200);
    expect(res.body.data.accessToken).toBe('acc');
  });

  it('POST /api/v1/auth/forgot-password returns 200', async () => {
    cognitoClient.send.mockResolvedValueOnce({});
    const res = await request(app).post('/api/v1/auth/forgot-password').send({ email: 'test@example.com' });
    expect(res.status).toBe(200);
  });

  it('GET /api/v1/auth/users returns list of users', async () => {
    ddbDocClient.send.mockResolvedValueOnce({ Items: [MOCK_USER] });
    const res = await request(app).get('/api/v1/auth/users');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
  });

  it('GET /api/v1/auth/profile returns 200 with JWT', async () => {
    ddbDocClient.send.mockResolvedValueOnce({ Item: MOCK_USER });
    const res = await request(app)
      .get('/api/v1/auth/profile')
      .set('Authorization', 'Bearer valid-token');
    expect(res.status).toBe(200);
    expect(res.body.data.email).toBe('test@example.com');
  });

  it('GET /api/v1/auth/profile returns 401 without token', async () => {
    // Missing Authorization header → middleware returns 401 immediately
    const res = await request(app).get('/api/v1/auth/profile');
    expect(res.status).toBe(401);
  });
});
