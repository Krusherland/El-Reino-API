const request = require('supertest');
const express = require('express');
const jwt = require('jwt-simple');
const moment = require('moment');
const { auth } = require('../../Middlewares/Auth');
const { secret } = require('../../Services/jwt');

// Create Express app for testing
const app = express();
app.use(express.json());

// Test route that uses auth middleware
app.get('/protected', auth, (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Access granted',
    user: req.user
  });
});

describe('Auth Middleware', () => {
  describe('auth middleware', () => {
    it('should deny access without authorization header', async () => {
      const response = await request(app)
        .get('/protected')
        .expect(403);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Authorization header is missing');
    });

    it('should deny access with empty authorization header', async () => {
      const response = await request(app)
        .get('/protected')
        .set('Authorization', '')
        .expect(403);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Authorization header is missing');
    });

    it('should allow access with valid token', async () => {
      const payload = {
        id: '507f1f77bcf86cd799439011',
        name: 'Test User',
        email: 'test@example.com',
        nickname: 'testuser',
        role: 'role_user',
        image: 'default.png',
        iat: moment().unix(),
        exp: moment().add(30, 'days').unix()
      };

      const token = jwt.encode(payload, secret);

      const response = await request(app)
        .get('/protected')
        .set('Authorization', token)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('Access granted');
      expect(response.body.user).toBeDefined();
      expect(response.body.user.id).toBe(payload.id);
      expect(response.body.user.email).toBe(payload.email);
    });

    it('should deny access with expired token', async () => {
      const payload = {
        id: '507f1f77bcf86cd799439011',
        name: 'Test User',
        email: 'test@example.com',
        nickname: 'testuser',
        role: 'role_user',
        image: 'default.png',
        iat: moment().subtract(31, 'days').unix(),
        exp: moment().subtract(1, 'day').unix() // Expired token
      };

      const token = jwt.encode(payload, secret);

      const response = await request(app)
        .get('/protected')
        .set('Authorization', token)
        .expect(401);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Invalid token');
    });

    it('should deny access with invalid token signature', async () => {
      const payload = {
        id: '507f1f77bcf86cd799439011',
        name: 'Test User',
        email: 'test@example.com',
        iat: moment().unix(),
        exp: moment().add(30, 'days').unix()
      };

      const invalidToken = jwt.encode(payload, 'wrong_secret');

      const response = await request(app)
        .get('/protected')
        .set('Authorization', invalidToken)
        .expect(401);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Invalid token');
      expect(response.body.debug).toBeDefined();
    });

    it('should deny access with malformed token', async () => {
      const malformedToken = 'this-is-not-a-valid-jwt-token';

      const response = await request(app)
        .get('/protected')
        .set('Authorization', malformedToken)
        .expect(401);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Invalid token');
      expect(response.body.debug).toBeDefined();
    });

    it('should handle token about to expire (edge case)', async () => {
      const payload = {
        id: '507f1f77bcf86cd799439011',
        name: 'Test User',
        email: 'test@example.com',
        iat: moment().unix(),
        exp: moment().add(1, 'second').unix() // Expires in 1 second
      };

      const token = jwt.encode(payload, secret);

      const response = await request(app)
        .get('/protected')
        .set('Authorization', token)
        .expect(200);

      expect(response.body.status).toBe('success');
    });

    it('should handle token with minimal payload', async () => {
      const payload = {
        id: '507f1f77bcf86cd799439011',
        iat: moment().unix(),
        exp: moment().add(30, 'days').unix()
      };

      const token = jwt.encode(payload, secret);

      const response = await request(app)
        .get('/protected')
        .set('Authorization', token)
        .expect(200);

      expect(response.body.user.id).toBe(payload.id);
      expect(response.body.user.name).toBeUndefined();
      expect(response.body.user.email).toBeUndefined();
    });

    it('should set req.user with complete token payload', async () => {
      const payload = {
        id: '507f1f77bcf86cd799439011',
        name: 'John Doe',
        email: 'john@example.com',
        nickname: 'johndoe',
        role: 'role_admin',
        image: 'avatar.jpg',
        iat: moment().unix(),
        exp: moment().add(30, 'days').unix()
      };

      const token = jwt.encode(payload, secret);

      const response = await request(app)
        .get('/protected')
        .set('Authorization', token)
        .expect(200);

      expect(response.body.user.id).toBe(payload.id);
      expect(response.body.user.name).toBe(payload.name);
      expect(response.body.user.email).toBe(payload.email);
      expect(response.body.user.nickname).toBe(payload.nickname);
      expect(response.body.user.role).toBe(payload.role);
      expect(response.body.user.image).toBe(payload.image);
      expect(response.body.user.iat).toBe(payload.iat);
      expect(response.body.user.exp).toBe(payload.exp);
    });
  });
});