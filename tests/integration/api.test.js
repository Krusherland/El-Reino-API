const request = require('supertest');
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const User = require('../../Models/user');
const Scroll = require('../../Models/scroll');
const Follow = require('../../Models/follow');

// Import routes
const UserRouter = require('../../Routes/userR');
const ScrollRouter = require('../../Routes/scrollR');
const FollowRouter = require('../../Routes/followR');

// Create Express app similar to main app
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/net/user', UserRouter);
app.use('/net/scroll', ScrollRouter);
app.use('/net/follow', FollowRouter);
app.use('/net/publication', PublicationRouter);
app.use('/net/follow', FollowRouter);

app.get('/', (req, res) => {
  return res.status(200).json({
    message: 'This is where it all begins'
  });
});

describe('API Integration Tests', () => {
  describe('Root Endpoint', () => {
    it('should return welcome message', async () => {
      const response = await request(app)
        .get('/')
        .expect(200);

      expect(response.body.message).toBe('This is where it all begins');
    });
  });

  describe('User Registration and Login Flow', () => {
    const userData = {
      name: 'Integration',
      surname: 'Test',
      nickname: 'integrationtest',
      email: 'integration@test.com',
      password: 'testpassword123'
    };

    it('should complete full user registration and login flow', async () => {
      // Step 1: Register user
      const registerResponse = await request(app)
        .post('/net/user/register')
        .send(userData)
        .expect(200);

      expect(registerResponse.body.status).toBe('success');
      expect(registerResponse.body.user.email).toBe(userData.email);

      // Step 2: Login with registered user
      const loginResponse = await request(app)
        .post('/net/user/login')
        .send({
          email: userData.email,
          password: userData.password
        })
        .expect(200);

      expect(loginResponse.body.status).toBe('success');
      expect(loginResponse.body.token).toBeDefined();
      expect(loginResponse.body.user.email).toBe(userData.email);

      const token = loginResponse.body.token;

      // Step 3: Access protected profile endpoint
      const profileResponse = await request(app)
        .get(`/net/user/profile/${loginResponse.body.user.id}`)
        .set('Authorization', token)
        .expect(200);

      expect(profileResponse.body.status).toBe('success');
      expect(profileResponse.body.user.email).toBe(userData.email);
    });
  });

  describe('Publication Workflow', () => {
    let userToken;
    let userId;

    beforeEach(async () => {
      // Create and login user
      const userData = {
        name: 'Publication',
        surname: 'User',
        nickname: 'pubuser',
        email: 'pub@test.com',
        password: 'testpass123'
      };

      await request(app)
        .post('/net/user/register')
        .send(userData);

      const loginResponse = await request(app)
        .post('/net/user/login')
        .send({
          email: userData.email,
          password: userData.password
        });

      userToken = loginResponse.body.token;
      userId = loginResponse.body.user.id;
    });

    it('should create, read, and delete publication', async () => {
      // Step 1: Create publication
      const publicationData = {
        text: 'This is a test publication for integration test'
      };

      const createResponse = await request(app)
        .post('/net/publication/save')
        .set('Authorization', userToken)
        .send(publicationData)
        .expect(200);

      expect(createResponse.body.status).toBe('success');
      expect(createResponse.body.publication.text).toBe(publicationData.text);

      const publicationId = createResponse.body.publication._id;

      // Step 2: Read publication detail
      const detailResponse = await request(app)
        .get(`/net/publication/detail/${publicationId}`)
        .set('Authorization', userToken)
        .expect(200);

      expect(detailResponse.body.status).toBe('success');
      expect(detailResponse.body.publication.text).toBe(publicationData.text);

      // Step 3: Get user's publications
      const userPublicationsResponse = await request(app)
        .get(`/net/publication/publications/${userId}`)
        .set('Authorization', userToken)
        .expect(200);

      expect(userPublicationsResponse.body.status).toBe('success');
      expect(userPublicationsResponse.body.publications).toHaveLength(1);

      // Step 4: Delete publication
      const deleteResponse = await request(app)
        .delete(`/net/publication/remove/${publicationId}`)
        .set('Authorization', userToken)
        .expect(200);

      expect(deleteResponse.body.status).toBe('success');

      // Step 5: Verify publication is deleted
      await request(app)
        .get(`/net/publication/detail/${publicationId}`)
        .set('Authorization', userToken)
        .expect(404);
    });

    it('should require authentication for protected publication endpoints', async () => {
      // Try to create publication without token
      await request(app)
        .post('/net/publication/save')
        .send({ text: 'Test publication' })
        .expect(403);

      // Try to delete publication without token
      await request(app)
        .delete('/net/publication/remove/507f1f77bcf86cd799439011')
        .expect(403);
    });
  });

  describe('User Management Workflow', () => {
    let userToken;
    let userId;

    beforeEach(async () => {
      const userData = {
        name: 'Management',
        surname: 'User',
        nickname: 'mgmtuser',
        email: 'mgmt@test.com',
        password: 'testpass123'
      };

      await request(app)
        .post('/net/user/register')
        .send(userData);

      const loginResponse = await request(app)
        .post('/net/user/login')
        .send({
          email: userData.email,
          password: userData.password
        });

      userToken = loginResponse.body.token;
      userId = loginResponse.body.user.id;
    });

    it('should update user profile', async () => {
      const updateData = {
        name: 'Updated Name',
        bio: 'Updated bio description'
      };

      const updateResponse = await request(app)
        .put('/net/user/update')
        .set('Authorization', userToken)
        .send(updateData)
        .expect(200);

      expect(updateResponse.body.status).toBe('success');
      expect(updateResponse.body.user.name).toBe(updateData.name);
      expect(updateResponse.body.user.bio).toBe(updateData.bio);
    });

    it('should get user list with pagination', async () => {
      // Create additional users for pagination test
      for (let i = 1; i <= 3; i++) {
        await request(app)
          .post('/net/user/register')
          .send({
            name: `Extra${i}`,
            surname: `User${i}`,
            nickname: `extra${i}`,
            email: `extra${i}@test.com`,
            password: 'testpass123'
          });
      }

      const listResponse = await request(app)
        .get('/net/user/list/1')
        .set('Authorization', userToken)
        .expect(200);

      expect(listResponse.body.status).toBe('success');
      expect(listResponse.body.users).toBeDefined();
      expect(listResponse.body.total).toBeGreaterThan(0);
      expect(listResponse.body.pages).toBeGreaterThan(0);
      expect(listResponse.body.currentPage).toBe(1);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid routes gracefully', async () => {
      const response = await request(app)
        .get('/non-existent-route')
        .expect(404);
    });

    it('should handle malformed JSON in request body', async () => {
      const response = await request(app)
        .post('/net/user/register')
        .set('Content-Type', 'application/json')
        .send('{"invalid": json}')
        .expect(400);
    });

    it('should validate required fields in registration', async () => {
      const incompleteData = {
        name: 'Test',
        email: 'test@example.com'
        // Missing required fields
      };

      const response = await request(app)
        .post('/net/user/register')
        .send(incompleteData)
        .expect(400);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('All fields are required');
    });
  });

  describe('CORS and Security Headers', () => {
    it('should include CORS headers', async () => {
      const response = await request(app)
        .get('/')
        .expect(200);

      expect(response.headers['access-control-allow-origin']).toBeDefined();
    });

    it('should handle preflight OPTIONS requests', async () => {
      const response = await request(app)
        .options('/net/user/register')
        .expect(204);

      expect(response.headers['access-control-allow-methods']).toBeDefined();
    });
  });
});