const request = require('supertest');
const app = require('../src/index');
const { CognitoJwtVerifier } = require('aws-jwt-verify');
const { DynamoDBDocumentClient } = require('@aws-sdk/lib-dynamodb');
const { SNSClient } = require('@aws-sdk/client-sns');

// Mock external AWS dependencies
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
    QueryCommand: jest.fn(),
    ScanCommand: jest.fn()
  };
});

jest.mock('@aws-sdk/client-sns', () => {
  return {
    SNSClient: jest.fn().mockImplementation(() => ({
      send: jest.fn()
    })),
    PublishCommand: jest.fn()
  };
});

// Import the mocked dynamo client to control its resolved values
const ddb = require('../src/utils/dynamoClient');
const sns = new SNSClient();

// Extract the mock verify function to control auth
const verifier = CognitoJwtVerifier.create();

describe('Product Service API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/v1/products', () => {
    it('should return a list of products successfully', async () => {
      ddb.send.mockResolvedValueOnce({
        Items: [{ productId: 'p1', name: 'Test Product', price: 100 }],
        LastEvaluatedKey: null
      });

      const res = await request(app).get('/api/v1/products');

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.items.length).toBe(1);
    });

    it('should return products by category', async () => {
      ddb.send.mockResolvedValueOnce({
        Items: [{ productId: 'p2', name: 'Cat Product', category: 'Electronics' }],
        LastEvaluatedKey: null
      });

      const res = await request(app).get('/api/v1/products?category=Electronics');

      expect(res.statusCode).toBe(200);
      expect(res.body.data.items[0].category).toBe('Electronics');
    });

    it('should handle database failures during list', async () => {
      ddb.send.mockRejectedValueOnce(new Error('DynamoDB Error'));

      const res = await request(app).get('/api/v1/products');

      expect(res.statusCode).toBe(500);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/products/search', () => {
    it('should return 422 if search query is missing', async () => {
      const res = await request(app).get('/api/v1/products/search');
      expect(res.statusCode).toBe(422);
      expect(res.body.message).toBe('Search query is required');
    });

    it('should return matched products', async () => {
      ddb.send.mockResolvedValueOnce({
        Items: [
          { productId: 'p1', name: 'Sony Headphones', description: 'Noise cancelling' },
          { productId: 'p2', name: 'Apple AirPods', description: 'Wireless earbuds' }
        ]
      });

      const res = await request(app).get('/api/v1/products/search?q=sony');

      expect(res.statusCode).toBe(200);
      expect(res.body.data.items.length).toBe(1);
      expect(res.body.data.items[0].name).toBe('Sony Headphones');
    });
  });

  describe('GET /api/v1/products/slug/:slug', () => {
    it('should return a product by slug', async () => {
      ddb.send.mockResolvedValueOnce({
        Items: [{ productId: 'p1', name: 'Test Product', slug: 'test-product' }]
      });

      const res = await request(app).get('/api/v1/products/slug/test-product');
      
      expect(res.statusCode).toBe(200);
      expect(res.body.data.name).toBe('Test Product');
    });

    it('should return 404 if product slug not found', async () => {
      ddb.send.mockResolvedValueOnce({ Items: [] });

      const res = await request(app).get('/api/v1/products/slug/unknown-product');
      
      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe('Product not found');
    });
  });

  describe('GET /api/v1/products/:productId', () => {
    it('should return a product by ID', async () => {
      ddb.send.mockResolvedValueOnce({
        Item: { productId: 'p1', name: 'Test Product' }
      });

      const res = await request(app).get('/api/v1/products/p1');
      
      expect(res.statusCode).toBe(200);
      expect(res.body.data.name).toBe('Test Product');
    });

    it('should return 404 if product not found', async () => {
      ddb.send.mockResolvedValueOnce({ Item: null });

      const res = await request(app).get('/api/v1/products/unknown');
      
      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe('Product not found');
    });
  });

  describe('POST /api/v1/products', () => {
    const validProduct = {
      name: 'New Product',
      description: 'A great product',
      price: 99.99,
      category: 'Electronics'
    };

    it('should create a product when user is ADMIN', async () => {
      verifier.verify.mockResolvedValueOnce({ sub: 'user1', 'cognito:groups': ['ADMIN'] });
      ddb.send.mockResolvedValueOnce({}); // PutCommand success

      const res = await request(app)
        .post('/api/v1/products')
        .set('Authorization', 'Bearer valid_admin_token')
        .send(validProduct);

      expect(res.statusCode).toBe(201);
      expect(res.body.data.name).toBe('New Product');
      expect(res.body.data.productId).toBeDefined();
      expect(res.body.data.slug).toBeDefined();
    });

    it('should return 403 if user is not ADMIN', async () => {
      verifier.verify.mockResolvedValueOnce({ sub: 'user2', 'cognito:groups': ['USER'] });

      const res = await request(app)
        .post('/api/v1/products')
        .set('Authorization', 'Bearer valid_user_token')
        .send(validProduct);

      expect(res.statusCode).toBe(403);
      expect(res.body.message).toBe('Forbidden: insufficient role');
    });

    it('should return 401 if token is missing', async () => {
      const res = await request(app)
        .post('/api/v1/products')
        .send(validProduct);

      expect(res.statusCode).toBe(401);
      expect(res.body.message).toBe('Invalid or expired token');
    });

    it('should return 422 if validation fails (missing name)', async () => {
      verifier.verify.mockResolvedValueOnce({ sub: 'user1', 'cognito:groups': ['ADMIN'] });

      const res = await request(app)
        .post('/api/v1/products')
        .set('Authorization', 'Bearer valid_token')
        .send({ price: 100 }); // missing required fields

      expect(res.statusCode).toBe(422);
      expect(res.body.message).toContain('Validation failed');
    });
  });

  describe('PATCH /api/v1/products/:productId', () => {
    it('should update a product when user is ADMIN', async () => {
      verifier.verify.mockResolvedValueOnce({ sub: 'user1', 'cognito:groups': ['ADMIN'] });
      ddb.send.mockResolvedValueOnce({
        Attributes: { productId: 'p1', name: 'Updated Name', version: 2 }
      });

      const res = await request(app)
        .patch('/api/v1/products/p1')
        .set('Authorization', 'Bearer admin_token')
        .send({ name: 'Updated Name', version: 1 });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.name).toBe('Updated Name');
    });

    it('should return 409 if version mismatch (concurrent update)', async () => {
      verifier.verify.mockResolvedValueOnce({ sub: 'user1', 'cognito:groups': ['ADMIN'] });
      
      const conflictError = new Error('The conditional request failed');
      conflictError.name = 'ConditionalCheckFailedException';
      ddb.send.mockRejectedValueOnce(conflictError);

      const res = await request(app)
        .patch('/api/v1/products/p1')
        .set('Authorization', 'Bearer admin_token')
        .send({ name: 'Update', version: 1 });

      expect(res.statusCode).toBe(409);
      expect(res.body.message).toContain('Product was modified elsewhere');
    });
  });

  describe('DELETE /api/v1/products/:productId', () => {
    it('should delete a product if ADMIN and product exists', async () => {
      verifier.verify.mockResolvedValueOnce({ sub: 'user1', 'cognito:groups': ['ADMIN'] });
      ddb.send.mockResolvedValueOnce({ Item: { productId: 'p1' } }); // getById success
      ddb.send.mockResolvedValueOnce({}); // remove success

      const res = await request(app)
        .delete('/api/v1/products/p1')
        .set('Authorization', 'Bearer admin_token');

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Product deleted');
    });

    it('should return 404 if trying to delete a non-existent product', async () => {
      verifier.verify.mockResolvedValueOnce({ sub: 'user1', 'cognito:groups': ['ADMIN'] });
      ddb.send.mockResolvedValueOnce({ Item: null }); // getById returns null

      const res = await request(app)
        .delete('/api/v1/products/unknown')
        .set('Authorization', 'Bearer admin_token');

      expect(res.statusCode).toBe(404);
    });
  });
});
