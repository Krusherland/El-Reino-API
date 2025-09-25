const bcrypt = require('bcrypt');
const jwt = require('jwt-simple');
const moment = require('moment');
const User = require('../Models/user');
const Publication = require('../Models/publication');
const Follow = require('../Models/follow');
const { secret } = require('../Services/jwt');

/**
 * Test utilities for El-Reino API tests
 */

/**
 * Creates a test user with hashed password
 * @param {Object} userData - User data object
 * @returns {Promise<User>} Created user
 */
const createTestUser = async (userData = {}) => {
  const defaultData = {
    name: 'Test',
    surname: 'User',
    nickname: 'testuser',
    email: 'test@example.com',
    password: 'password123'
  };

  const mergedData = { ...defaultData, ...userData };
  
  if (mergedData.password) {
    mergedData.password = await bcrypt.hash(mergedData.password, 10);
  }

  const user = new User(mergedData);
  return await user.save();
};

/**
 * Creates multiple test users
 * @param {number} count - Number of users to create
 * @param {Object} baseData - Base data for users
 * @returns {Promise<User[]>} Array of created users
 */
const createTestUsers = async (count = 3, baseData = {}) => {
  const users = [];
  for (let i = 1; i <= count; i++) {
    const userData = {
      name: `User${i}`,
      surname: `Surname${i}`,
      nickname: `user${i}`,
      email: `user${i}@example.com`,
      password: 'password123',
      ...baseData
    };
    users.push(await createTestUser(userData));
  }
  return users;
};

/**
 * Creates a test publication
 * @param {string} userId - User ID who owns the publication
 * @param {Object} publicationData - Publication data
 * @returns {Promise<Publication>} Created publication
 */
const createTestPublication = async (userId, publicationData = {}) => {
  const defaultData = {
    user: userId,
    text: 'Test publication text'
  };

  const mergedData = { ...defaultData, ...publicationData };
  const publication = new Publication(mergedData);
  return await publication.save();
};

/**
 * Creates multiple test publications for a user
 * @param {string} userId - User ID who owns the publications
 * @param {number} count - Number of publications to create
 * @returns {Promise<Publication[]>} Array of created publications
 */
const createTestPublications = async (userId, count = 3) => {
  const publications = [];
  for (let i = 1; i <= count; i++) {
    const publicationData = {
      text: `Test publication ${i} content`
    };
    publications.push(await createTestPublication(userId, publicationData));
  }
  return publications;
};

/**
 * Creates a follow relationship
 * @param {string} userId - User who follows
 * @param {string} followedId - User being followed
 * @returns {Promise<Follow>} Created follow relationship
 */
const createTestFollow = async (userId, followedId) => {
  const follow = new Follow({
    user: userId,
    followers: followedId
  });
  return await follow.save();
};

/**
 * Generates a valid JWT token for testing
 * @param {Object} userData - User data to include in token
 * @returns {string} JWT token
 */
const generateTestToken = (userData = {}) => {
  const defaultPayload = {
    id: '507f1f77bcf86cd799439011',
    name: 'Test User',
    email: 'test@example.com',
    nickname: 'testuser',
    role: 'role_user',
    image: 'default.png',
    iat: moment().unix(),
    exp: moment().add(30, 'days').unix()
  };

  const payload = { ...defaultPayload, ...userData };
  return jwt.encode(payload, secret);
};

/**
 * Generates an expired JWT token for testing
 * @param {Object} userData - User data to include in token
 * @returns {string} Expired JWT token
 */
const generateExpiredToken = (userData = {}) => {
  const defaultPayload = {
    id: '507f1f77bcf86cd799439011',
    name: 'Test User',
    email: 'test@example.com',
    nickname: 'testuser',
    role: 'role_user',
    image: 'default.png',
    iat: moment().subtract(31, 'days').unix(),
    exp: moment().subtract(1, 'day').unix()
  };

  const payload = { ...defaultPayload, ...userData };
  return jwt.encode(payload, secret);
};

/**
 * Generates an invalid JWT token for testing
 * @returns {string} Invalid JWT token
 */
const generateInvalidToken = () => {
  const payload = {
    id: '507f1f77bcf86cd799439011',
    name: 'Test User',
    iat: moment().unix(),
    exp: moment().add(30, 'days').unix()
  };
  return jwt.encode(payload, 'wrong_secret');
};

/**
 * Creates a mock Express request object
 * @param {Object} options - Request options
 * @returns {Object} Mock request object
 */
const createMockRequest = (options = {}) => {
  return {
    body: options.body || {},
    params: options.params || {},
    query: options.query || {},
    headers: options.headers || {},
    user: options.user || null,
    file: options.file || null,
    files: options.files || null,
    ...options
  };
};

/**
 * Creates a mock Express response object
 * @returns {Object} Mock response object with spies
 */
const createMockResponse = () => {
  const res = {
    statusCode: 200,
    responseData: null
  };

  res.status = jest.fn().mockImplementation((code) => {
    res.statusCode = code;
    return res;
  });

  res.json = jest.fn().mockImplementation((data) => {
    res.responseData = data;
    return res;
  });

  res.send = jest.fn().mockImplementation((data) => {
    res.responseData = data;
    return res;
  });

  res.sendFile = jest.fn().mockImplementation((path) => {
    res.responseData = { filePath: path };
    return res;
  });

  return res;
};

/**
 * Waits for a specified amount of time
 * @param {number} ms - Milliseconds to wait
 * @returns {Promise} Promise that resolves after the wait
 */
const wait = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Validates MongoDB ObjectId format
 * @param {string} id - ID to validate
 * @returns {boolean} True if valid ObjectId format
 */
const isValidObjectId = (id) => {
  const objectIdRegex = /^[0-9a-fA-F]{24}$/;
  return objectIdRegex.test(id);
};

/**
 * Compares passwords with bcrypt
 * @param {string} plainPassword - Plain text password
 * @param {string} hashedPassword - Hashed password
 * @returns {boolean} True if passwords match
 */
const comparePasswords = (plainPassword, hashedPassword) => {
  return bcrypt.compareSync(plainPassword, hashedPassword);
};

module.exports = {
  createTestUser,
  createTestUsers,
  createTestPublication,
  createTestPublications,
  createTestFollow,
  generateTestToken,
  generateExpiredToken,
  generateInvalidToken,
  createMockRequest,
  createMockResponse,
  wait,
  isValidObjectId,
  comparePasswords
};