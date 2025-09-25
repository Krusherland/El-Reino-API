# El-Reino API Test Suite

This comprehensive test suite provides unit, integration, and service tests for the El-Reino API project. The tests are built using Jest and Supertest, with MongoDB Memory Server for isolated database testing.

## 🚀 Getting Started

### Prerequisites

Make sure you have Node.js and npm installed. Then install the test dependencies:

```bash
npm install
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run specific test file
npm test -- user.test.js

# Run tests matching a pattern
npm test -- --testNamePattern="should register"
```

## 📁 Test Structure

```
tests/
├── setup.js                    # Test environment setup
├── controllers/                # Controller tests
│   ├── user.test.js            # User controller tests
│   ├── publication.test.js     # Publication controller tests
│   └── follow.test.js          # Follow controller tests
├── models/                     # Model tests
│   ├── user.test.js            # User model tests
│   ├── publication.test.js     # Publication model tests
│   └── follow.test.js          # Follow model tests
├── services/                   # Service tests
│   ├── jwt.test.js             # JWT service tests
│   └── followService.test.js   # Follow service tests
├── middlewares/                # Middleware tests
│   └── auth.test.js            # Authentication middleware tests
├── integration/                # Integration tests
│   └── api.test.js             # Full API integration tests
└── utils/                      # Test utilities
    └── testHelpers.js          # Test helper functions
```

## 🧪 Test Categories

### Unit Tests

**Model Tests**: Test database schemas, validation, and basic CRUD operations
- User model validation and creation
- Publication model relationships and constraints
- Follow model relationships

**Service Tests**: Test business logic and utility functions
- JWT token creation and validation
- Follow service for user relationships

**Controller Tests**: Test API endpoint logic (isolated from HTTP layer)
- User registration, login, profile management
- Publication creation, retrieval, deletion
- Follow/unfollow functionality

**Middleware Tests**: Test authentication and request processing
- JWT token validation
- Authorization checks
- Error handling

### Integration Tests

**API Integration Tests**: Test complete request/response cycles
- Full user registration and login workflow
- Publication CRUD operations with authentication
- User management with proper authorization
- Error handling and validation
- CORS and security headers

## 🛠️ Test Technologies

- **Jest**: Testing framework with mocking and assertion capabilities
- **Supertest**: HTTP assertion library for testing Express apps
- **MongoDB Memory Server**: In-memory MongoDB for isolated testing
- **bcrypt**: Password hashing for user authentication tests

## 📊 Test Coverage

The test suite covers:

### Models (100% coverage target)
- ✅ User schema validation
- ✅ Publication schema validation  
- ✅ Follow relationship validation
- ✅ Default values and required fields
- ✅ Model relationships and population

### Controllers (95%+ coverage target)
- ✅ User registration and validation
- ✅ User login and authentication
- ✅ User profile management
- ✅ User list with pagination
- ✅ Publication CRUD operations
- ✅ Publication file upload handling
- ✅ Follow/unfollow operations
- ✅ Error handling and edge cases

### Services (100% coverage target)
- ✅ JWT token creation and validation
- ✅ Follow service user relationships
- ✅ Error handling in services

### Middlewares (100% coverage target)
- ✅ Authentication middleware
- ✅ Token validation and expiration
- ✅ Authorization header handling

### Integration (90%+ coverage target)
- ✅ Complete user workflows
- ✅ API security and CORS
- ✅ Error handling across endpoints
- ✅ Request validation

## 🔧 Configuration

### Jest Configuration (`jest.config.js`)
```javascript
module.exports = {
  testEnvironment: 'node',
  collectCoverageFrom: [
    'Controllers/**/*.js',
    'Models/**/*.js', 
    'Services/**/*.js',
    'Middlewares/**/*.js'
  ],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js']
};
```

### Test Setup (`tests/setup.js`)
- Configures MongoDB Memory Server
- Sets up test database connections
- Handles cleanup between tests

## 🧰 Test Utilities

The `testHelpers.js` file provides utility functions:

- `createTestUser()`: Creates test users with hashed passwords
- `createTestPublication()`: Creates test publications
- `generateTestToken()`: Generates valid JWT tokens
- `generateExpiredToken()`: Generates expired tokens for testing
- `createMockRequest/Response()`: Mock Express objects

## 🚨 Common Test Patterns

### Testing Controllers
```javascript
const response = await request(app)
  .post('/endpoint')
  .send(testData)
  .expect(200);

expect(response.body.status).toBe('success');
```

### Testing with Authentication
```javascript
const token = generateTestToken({ id: userId });
const response = await request(app)
  .get('/protected-endpoint')
  .set('Authorization', token)
  .expect(200);
```

### Testing Models
```javascript
const user = new User(userData);
const savedUser = await user.save();
expect(savedUser._id).toBeDefined();
```

## 📈 Continuous Integration

Tests are designed to run in CI/CD environments:
- No external dependencies (uses in-memory database)
- Deterministic test data
- Proper cleanup between tests
- Comprehensive error handling

## 🐛 Debugging Tests

### Running Individual Test Files
```bash
npm test -- controllers/user.test.js
```

### Debug Mode
```bash
npm test -- --detectOpenHandles --forceExit
```

### Verbose Output
```bash
npm test -- --verbose
```

## 📝 Writing New Tests

When adding new features, ensure tests cover:

1. **Happy Path**: Normal operation
2. **Error Cases**: Invalid input, missing data
3. **Edge Cases**: Boundary conditions
4. **Security**: Authentication and authorization
5. **Integration**: End-to-end workflows

### Test Naming Convention
```javascript
describe('ComponentName', () => {
  describe('methodName', () => {
    it('should perform expected behavior', async () => {
      // Test implementation
    });
  });
});
```

## 🔍 Coverage Reports

After running `npm run test:coverage`, view reports:
- Terminal: Summary in console
- HTML: `coverage/index.html` (detailed visual report)
- LCOV: `coverage/lcov.info` (for CI tools)

## 🚀 Best Practices

1. **Isolation**: Each test should be independent
2. **Cleanup**: Always clean up test data
3. **Mocking**: Mock external dependencies
4. **Descriptive**: Use clear, descriptive test names
5. **Coverage**: Aim for high test coverage
6. **Performance**: Keep tests fast and efficient

---

For questions or contributions to the test suite, please refer to the main project documentation or create an issue in the repository.