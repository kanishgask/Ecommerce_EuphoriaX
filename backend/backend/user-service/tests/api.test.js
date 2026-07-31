const request = require('supertest');
const app = require('../src/index');
const { CognitoJwtVerifier } = require('aws-jwt-verify');
const { DynamoDBDocumentClient } = require('@aws-sdk/lib-dynamodb');

jest.mock('aws-jwt-verify', () => ({
  CognitoJwtVerifier: {
    create: jest.fn().mockReturnValue({
      verify: jest.fn()
    })
  }
}));

jest.mock('@aws-sdk/lib-dynamodb', () => {
  const original = jest.requireActual('@aws-sdk/lib-dynamodb');
  return {
    ...original,
    DynamoDBDocumentClient: {
      from: jest.fn().mockReturnValue({
        send: jest.fn()
      })
    },
    GetCommand: jest.fn(),
    PutCommand: jest.fn(),
    UpdateCommand: jest.fn(),
    DeleteCommand: jest.fn(),
    ScanCommand: jest.fn()
  };
});

const ddb = require('../src/utils/dynamoClient');
const verifier = CognitoJwtVerifier.create();

describe('User Service API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Self-Service Endpoints (/api/v1/users/me)', () => {
    it('should return profile and create it if missing (upsert)', async () => {
      verifier.verify.mockResolvedValueOnce({ sub: 'user1', username: 'testuser', groups: [] });
      
      // Simulate profile not existing initially, then PutCommand succeeds, then getById returns it
      ddb.send
        .mockResolvedValueOnce({ Item: null }) // getById
        .mockResolvedValueOnce({}) // PutCommand
        .mockResolvedValueOnce({ Item: { userId: 'user1', role: 'USER' } }); // second getById

      const res = await request(app)
        .get('/api/v1/users/me')
        .set('Authorization', 'Bearer token');

      expect(res.statusCode).toBe(200);
      expect(res.body.data.role).toBe('USER');
    });

    it('should handle race condition during upsert (ConditionalCheckFailed)', async () => {
      verifier.verify.mockResolvedValueOnce({ sub: 'user1', username: 'testuser', groups: [] });
      
      const conditionalError = new Error('Condition failed');
      conditionalError.name = 'ConditionalCheckFailedException';

      ddb.send
        .mockResolvedValueOnce({ Item: null }) // getById
        .mockRejectedValueOnce(conditionalError) // PutCommand fails due to race
        .mockResolvedValueOnce({ Item: { userId: 'user1', role: 'USER' } }); // second getById fetches it successfully

      const res = await request(app)
        .get('/api/v1/users/me')
        .set('Authorization', 'Bearer token');

      expect(res.statusCode).toBe(200);
    });

    it('should update own profile', async () => {
      verifier.verify.mockResolvedValueOnce({ sub: 'user1', username: 'testuser', groups: [] });
      
      ddb.send.mockResolvedValueOnce({
        Attributes: { userId: 'user1', name: 'Updated Name', version: 2 }
      });

      const res = await request(app)
        .patch('/api/v1/users/me')
        .set('Authorization', 'Bearer token')
        .send({ name: 'Updated Name', version: 1 });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.name).toBe('Updated Name');
    });

    it('should return 409 if version mismatch occurs during profile update', async () => {
      verifier.verify.mockResolvedValueOnce({ sub: 'user1', username: 'testuser', groups: [] });
      
      const conflictError = new Error('Conflict');
      conflictError.name = 'ConditionalCheckFailedException';
      ddb.send.mockRejectedValueOnce(conflictError);

      const res = await request(app)
        .patch('/api/v1/users/me')
        .set('Authorization', 'Bearer token')
        .send({ name: 'Conflict Update', version: 1 });

      expect(res.statusCode).toBe(409);
      expect(res.body.message).toContain('Profile was modified elsewhere');
    });

    it('should fail profile update on validation error', async () => {
      verifier.verify.mockResolvedValueOnce({ sub: 'user1', username: 'testuser', groups: [] });
      
      const res = await request(app)
        .patch('/api/v1/users/me')
        .set('Authorization', 'Bearer token')
        .send({ invalidField: 'Not allowed' });

      expect(res.statusCode).toBe(422);
    });
  });

  describe('Admin Endpoints (/api/v1/users)', () => {
    it('should list users if ADMIN', async () => {
      verifier.verify.mockResolvedValueOnce({ sub: 'admin', 'cognito:groups': ['ADMIN'] });
      
      ddb.send.mockResolvedValueOnce({
        Items: [{ userId: 'user1', role: 'USER' }],
        LastEvaluatedKey: null
      });

      const res = await request(app)
        .get('/api/v1/users')
        .set('Authorization', 'Bearer admin_token');

      expect(res.statusCode).toBe(200);
      expect(res.body.data.items.length).toBe(1);
    });

    it('should return 403 if USER attempts to list users', async () => {
      verifier.verify.mockResolvedValueOnce({ sub: 'user1', 'cognito:groups': ['USER'] });
      
      const res = await request(app)
        .get('/api/v1/users')
        .set('Authorization', 'Bearer user_token');

      expect(res.statusCode).toBe(403);
    });

    it('should get a user by ID if ADMIN', async () => {
      verifier.verify.mockResolvedValueOnce({ sub: 'admin', 'cognito:groups': ['ADMIN'] });
      
      ddb.send.mockResolvedValueOnce({ Item: { userId: 'user1' } });

      const res = await request(app)
        .get('/api/v1/users/user1')
        .set('Authorization', 'Bearer admin_token');

      expect(res.statusCode).toBe(200);
      expect(res.body.data.userId).toBe('user1');
    });

    it('should return 404 if user not found by ID', async () => {
      verifier.verify.mockResolvedValueOnce({ sub: 'admin', 'cognito:groups': ['ADMIN'] });
      
      ddb.send.mockResolvedValueOnce({ Item: null });

      const res = await request(app)
        .get('/api/v1/users/unknown')
        .set('Authorization', 'Bearer admin_token');

      expect(res.statusCode).toBe(404);
    });

    it('should update user role if ADMIN', async () => {
      verifier.verify.mockResolvedValueOnce({ sub: 'admin', 'cognito:groups': ['ADMIN'] });
      
      ddb.send.mockResolvedValueOnce({ Attributes: { userId: 'user1', role: 'ADMIN' } });

      const res = await request(app)
        .patch('/api/v1/users/user1/role')
        .set('Authorization', 'Bearer admin_token')
        .send({ role: 'ADMIN', version: 1 });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.role).toBe('ADMIN');
    });

    it('should handle 409 concurrently when updating role', async () => {
      verifier.verify.mockResolvedValueOnce({ sub: 'admin', 'cognito:groups': ['ADMIN'] });
      
      const conflictError = new Error('Conflict');
      conflictError.name = 'ConditionalCheckFailedException';
      ddb.send.mockRejectedValueOnce(conflictError);

      const res = await request(app)
        .patch('/api/v1/users/user1/role')
        .set('Authorization', 'Bearer admin_token')
        .send({ role: 'ADMIN', version: 1 });

      expect(res.statusCode).toBe(409);
    });

    it('should update user status if ADMIN', async () => {
      verifier.verify.mockResolvedValueOnce({ sub: 'admin', 'cognito:groups': ['ADMIN'] });
      
      ddb.send.mockResolvedValueOnce({ Attributes: { userId: 'user1', status: 'SUSPENDED' } });

      const res = await request(app)
        .patch('/api/v1/users/user1/status')
        .set('Authorization', 'Bearer admin_token')
        .send({ status: 'SUSPENDED', version: 1 });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.status).toBe('SUSPENDED');
    });

    it('should handle 409 concurrently when updating status', async () => {
      verifier.verify.mockResolvedValueOnce({ sub: 'admin', 'cognito:groups': ['ADMIN'] });
      
      const conflictError = new Error('Conflict');
      conflictError.name = 'ConditionalCheckFailedException';
      ddb.send.mockRejectedValueOnce(conflictError);

      const res = await request(app)
        .patch('/api/v1/users/user1/status')
        .set('Authorization', 'Bearer admin_token')
        .send({ status: 'SUSPENDED', version: 1 });

      expect(res.statusCode).toBe(409);
    });

    it('should throw generic error when updating status fails generically', async () => {
      verifier.verify.mockResolvedValueOnce({ sub: 'admin', 'cognito:groups': ['ADMIN'] });
      
      const genericError = new Error('Generic failure');
      ddb.send.mockRejectedValueOnce(genericError);

      const res = await request(app)
        .patch('/api/v1/users/user1/status')
        .set('Authorization', 'Bearer admin_token')
        .send({ status: 'SUSPENDED', version: 1 });

      expect(res.statusCode).toBe(500);
    });

    it('should delete user if ADMIN', async () => {
      verifier.verify.mockResolvedValueOnce({ sub: 'admin', 'cognito:groups': ['ADMIN'] });
      
      ddb.send.mockResolvedValueOnce({});

      const res = await request(app)
        .delete('/api/v1/users/user1')
        .set('Authorization', 'Bearer admin_token');

      expect(res.statusCode).toBe(200);
    });
  });
});
