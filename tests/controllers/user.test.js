const request = require('supertest');
const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../../Models/user');
const userController = require('../../Controllers/user');
const jwt = require('../../Services/jwt');

// Create Express app for testing
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mock middleware for authentication
const mockAuth = (req, res, next) => {
  req.user = { 
    id: '507f1f77bcf86cd799439011',
    name: 'Test User',
    email: 'test@example.com'
  };
  next();
};

// Set up routes
app.get('/test', userController.pruebaUser);
app.post('/register', userController.register);
app.post('/login', userController.login);
app.get('/profile/:id', mockAuth, userController.profile);
app.get('/list/:page', mockAuth, userController.list);
app.get('/list', mockAuth, userController.list);
app.put('/update', mockAuth, userController.update);
app.get('/counter/:id', mockAuth, userController.counter);
app.get('/counter', mockAuth, userController.counter);

describe('User Controller', () => {
  describe('pruebaUser', () => {
    it('should return success message', async () => {
      const response = await request(app)
        .get('/test')
        .expect(200);

      expect(response.body.message).toBe('User endpoint working');
    });
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        name: 'John',
        surname: 'Doe',
        nickname: 'johndoe',
        email: 'john@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/register')
        .send(userData)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('User registered successfully');
      expect(response.body.user).toBeDefined();
      expect(response.body.user.email).toBe(userData.email);
      expect(response.body.user.nickname).toBe(userData.nickname);
      expect(response.body.user.password).not.toBe(userData.password); // Should be hashed
    });

    it('should fail with missing required fields', async () => {
      const userData = {
        name: 'John',
        email: 'john@example.com'
        // Missing surname, nickname, password
      };

      const response = await request(app)
        .post('/register')
        .send(userData)
        .expect(400);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('All fields are required');
    });

    it('should fail when user already exists', async () => {
      const userData = {
        name: 'Jane',
        surname: 'Smith',
        nickname: 'janesmith',
        email: 'jane@example.com',
        password: 'password123'
      };

      // Create user first
      const user = new User({
        ...userData,
        password: await bcrypt.hash(userData.password, 10)
      });
      await user.save();

      // Try to register same user
      const response = await request(app)
        .post('/register')
        .send(userData)
        .expect(409);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('User already exists');
    });

    it('should fail when email already exists', async () => {
      const existingUser = {
        name: 'Existing',
        surname: 'User',
        nickname: 'existing',
        email: 'existing@example.com',
        password: 'password123'
      };

      // Create user first
      const user = new User({
        ...existingUser,
        password: await bcrypt.hash(existingUser.password, 10)
      });
      await user.save();

      const newUserData = {
        name: 'New',
        surname: 'User',
        nickname: 'newuser',
        email: 'existing@example.com', // Same email
        password: 'password456'
      };

      const response = await request(app)
        .post('/register')
        .send(newUserData)
        .expect(409);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('User already exists');
    });

    it('should fail when nickname already exists', async () => {
      const existingUser = {
        name: 'Existing',
        surname: 'User',
        nickname: 'existingnick',
        email: 'existing@example.com',
        password: 'password123'
      };

      // Create user first
      const user = new User({
        ...existingUser,
        password: await bcrypt.hash(existingUser.password, 10)
      });
      await user.save();

      const newUserData = {
        name: 'New',
        surname: 'User',
        nickname: 'existingnick', // Same nickname
        email: 'new@example.com',
        password: 'password456'
      };

      const response = await request(app)
        .post('/register')
        .send(newUserData)
        .expect(409);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('User already exists');
    });
  });

  describe('login', () => {
    let testUser;
    const userPassword = 'password123';

    beforeEach(async () => {
      testUser = new User({
        name: 'Test',
        surname: 'User',
        nickname: 'testuser',
        email: 'test@example.com',
        password: await bcrypt.hash(userPassword, 10)
      });
      await testUser.save();
    });

    it('should login successfully with valid credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: userPassword
      };

      const response = await request(app)
        .post('/login')
        .send(loginData)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('Login successful');
      expect(response.body.user).toBeDefined();
      expect(response.body.user.email).toBe(testUser.email);
      expect(response.body.token).toBeDefined();
    });

    it('should fail with missing email', async () => {
      const loginData = {
        password: userPassword
      };

      const response = await request(app)
        .post('/login')
        .send(loginData)
        .expect(400);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Email and password are required');
    });

    it('should fail with missing password', async () => {
      const loginData = {
        email: 'test@example.com'
      };

      const response = await request(app)
        .post('/login')
        .send(loginData)
        .expect(400);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Email and password are required');
    });

    it('should fail with non-existent user', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: userPassword
      };

      const response = await request(app)
        .post('/login')
        .send(loginData)
        .expect(404);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('User not found');
    });

    it('should fail with incorrect password', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };

      const response = await request(app)
        .post('/login')
        .send(loginData)
        .expect(401);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Invalid email or password');
    });

    it('should return user data without password', async () => {
      const loginData = {
        email: 'test@example.com',
        password: userPassword
      };

      const response = await request(app)
        .post('/login')
        .send(loginData)
        .expect(200);

      expect(response.body.user.password).toBeUndefined();
      expect(response.body.user.id).toBeDefined();
      expect(response.body.user.name).toBe(testUser.name);
      expect(response.body.user.email).toBe(testUser.email);
      expect(response.body.user.nickname).toBe(testUser.nickname);
    });
  });

  describe('profile', () => {
    let testUser;

    beforeEach(async () => {
      testUser = new User({
        name: 'Profile',
        surname: 'User',
        nickname: 'profileuser',
        email: 'profile@example.com',
        password: await bcrypt.hash('password123', 10)
      });
      await testUser.save();
    });

    it('should return user profile', async () => {
      const response = await request(app)
        .get(`/profile/${testUser._id}`)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.user).toBeDefined();
      expect(response.body.user.name).toBe(testUser.name);
      expect(response.body.user.email).toBe(testUser.email);
      expect(response.body.user.password).toBeUndefined(); // Should be excluded
      expect(response.body.user.role).toBeUndefined(); // Should be excluded
    });

    it('should return 404 for non-existent user', async () => {
      const fakeId = '507f1f77bcf86cd799439999';
      
      const response = await request(app)
        .get(`/profile/${fakeId}`)
        .expect(404);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('User not found');
    });
  });

  describe('update', () => {
    let testUser;

    beforeEach(async () => {
      testUser = new User({
        _id: '507f1f77bcf86cd799439011', // Same as mock auth
        name: 'Update',
        surname: 'User',
        nickname: 'updateuser',
        email: 'update@example.com',
        password: await bcrypt.hash('password123', 10)
      });
      await testUser.save();
    });

    it('should update user successfully', async () => {
      const updateData = {
        name: 'Updated Name',
        bio: 'Updated bio'
      };

      const response = await request(app)
        .put('/update')
        .send(updateData)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('User updated successfully');
      expect(response.body.user.name).toBe(updateData.name);
      expect(response.body.user.bio).toBe(updateData.bio);
      expect(response.body.user.password).toBeUndefined(); // Should be excluded
    });

    it('should hash password when updating', async () => {
      const updateData = {
        password: 'newpassword123'
      };

      const response = await request(app)
        .put('/update')
        .send(updateData)
        .expect(200);

      expect(response.body.status).toBe('success');
      
      // Verify password was hashed
      const updatedUser = await User.findById(testUser._id);
      expect(updatedUser.password).not.toBe(updateData.password);
      expect(bcrypt.compareSync(updateData.password, updatedUser.password)).toBe(true);
    });

    it('should fail when email already exists', async () => {
      // Create another user
      const anotherUser = new User({
        name: 'Another',
        surname: 'User',
        nickname: 'another',
        email: 'another@example.com',
        password: await bcrypt.hash('password123', 10)
      });
      await anotherUser.save();

      const updateData = {
        email: 'another@example.com' // Trying to use existing email
      };

      const response = await request(app)
        .put('/update')
        .send(updateData)
        .expect(409);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Email or nickname already exists');
    });

    it('should not update protected fields', async () => {
      const updateData = {
        role: 'admin',
        image: 'hacker.jpg',
        iat: 123456,
        exp: 789012
      };

      const response = await request(app)
        .put('/update')
        .send(updateData)
        .expect(200);

      expect(response.body.user.role).toBe('role_user'); // Should remain unchanged
      expect(response.body.user.image).toBe('default.png'); // Should remain unchanged
    });
  });

  describe('list', () => {
    beforeEach(async () => {
      // Create multiple test users
      const users = [];
      for (let i = 1; i <= 10; i++) {
        users.push({
          name: `User${i}`,
          surname: `Surname${i}`,
          nickname: `user${i}`,
          email: `user${i}@example.com`,
          password: await bcrypt.hash('password123', 10)
        });
      }
      await User.insertMany(users);
    });

    it('should return paginated list of users', async () => {
      const response = await request(app)
        .get('/list/1')
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.users).toBeDefined();
      expect(response.body.users.length).toBeLessThanOrEqual(5); // itemsPerPage = 5
      expect(response.body.total).toBeGreaterThan(0);
      expect(response.body.pages).toBeGreaterThan(0);
      expect(response.body.currentPage).toBe(1);
    });

    it('should exclude sensitive fields from user list', async () => {
      const response = await request(app)
        .get('/list/1')
        .expect(200);

      expect(response.body.users[0].password).toBeUndefined();
      expect(response.body.users[0].role).toBeUndefined();
      expect(response.body.users[0].email).toBeUndefined();
      expect(response.body.users[0].__v).toBeUndefined();
    });

    it('should return second page correctly', async () => {
      const response = await request(app)
        .get('/list/2')
        .expect(200);

      expect(response.body.currentPage).toBe(2);
    });

    it('should default to page 1 when no page specified', async () => {
      const response = await request(app)
        .get('/list')
        .expect(200);

      expect(response.body.currentPage).toBe(1);
    });
  });
});