const request = require('supertest');
const app = require('../app');
const User = require('../src/models/User');

describe('User Service API', () => {
  beforeAll(async () => {
    // Clear users collection before tests
    await User.deleteMany({});
  });

  afterAll(async () => {
    // Clean up after tests
    await User.deleteMany({});
  });

  describe('POST /users/register', () => {
    test('Should register a new user successfully', async () => {
      const response = await request(app)
        .post('/users/register')
        .send({
          name: 'John Doe',
          email: 'john@example.com',
          password: '123456'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe('john@example.com');
      expect(response.body.data.token).toBeDefined();
    });

    test('Should fail with invalid email', async () => {
      const response = await request(app)
        .post('/users/register')
        .send({
          name: 'Jane Doe',
          email: 'invalid-email',
          password: '123456'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test('Should fail with short password', async () => {
      const response = await request(app)
        .post('/users/register')
        .send({
          name: 'Jane Doe',
          email: 'jane@example.com',
          password: '123'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test('Should fail with duplicate email', async () => {
      const response = await request(app)
        .post('/users/register')
        .send({
          name: 'Duplicate User',
          email: 'john@example.com',
          password: '123456'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('already exists');
    });
  });

  describe('POST /users/login', () => {
    test('Should login successfully with correct credentials', async () => {
      const response = await request(app)
        .post('/users/login')
        .send({
          email: 'john@example.com',
          password: '123456'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.token).toBeDefined();
    });

    test('Should fail with incorrect password', async () => {
      const response = await request(app)
        .post('/users/login')
        .send({
          email: 'john@example.com',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    test('Should fail with non-existent email', async () => {
      const response = await request(app)
        .post('/users/login')
        .send({
          email: 'nonexistent@example.com',
          password: '123456'
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /health', () => {
    test('Should return health status', async () => {
      const response = await request(app).get('/health');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('User Service is running');
    });
  });
});
