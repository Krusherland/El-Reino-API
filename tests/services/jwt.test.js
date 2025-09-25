const jwt = require('jwt-simple');
const moment = require('moment');
const { createToken, secret } = require('../../Services/jwt');

describe('JWT Service', () => {
  const mockUser = {
    _id: '507f1f77bcf86cd799439011',
    name: 'John',
    email: 'john@example.com',
    nickname: 'johndoe',
    role: 'role_user',
    image: 'default.png'
  };

  describe('createToken', () => {
    it('should create a valid JWT token', () => {
      const token = createToken(mockUser);
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT has 3 parts separated by dots
    });

    it('should create token with correct payload', () => {
      const token = createToken(mockUser);
      const decoded = jwt.decode(token, secret);

      expect(decoded.id).toBe(mockUser._id);
      expect(decoded.name).toBe(mockUser.name);
      expect(decoded.email).toBe(mockUser.email);
      expect(decoded.nickname).toBe(mockUser.nickname);
      expect(decoded.role).toBe(mockUser.role);
      expect(decoded.image).toBe(mockUser.image);
      expect(decoded.iat).toBeDefined();
      expect(decoded.exp).toBeDefined();
    });

    it('should set expiration 30 days from now', () => {
      const beforeToken = moment().unix();
      const token = createToken(mockUser);
      const afterToken = moment().unix();
      const decoded = jwt.decode(token, secret);

      const expectedExpMin = moment().add(30, 'days').unix() - 1;
      const expectedExpMax = moment().add(30, 'days').unix() + 1;

      expect(decoded.iat).toBeGreaterThanOrEqual(beforeToken);
      expect(decoded.iat).toBeLessThanOrEqual(afterToken);
      expect(decoded.exp).toBeGreaterThanOrEqual(expectedExpMin);
      expect(decoded.exp).toBeLessThanOrEqual(expectedExpMax);
    });

    it('should create different tokens for different users', () => {
      const mockUser2 = {
        ...mockUser,
        _id: '507f1f77bcf86cd799439012',
        email: 'jane@example.com'
      };

      const token1 = createToken(mockUser);
      const token2 = createToken(mockUser2);

      expect(token1).not.toBe(token2);
    });

    it('should create tokens that can be decoded with the secret', () => {
      const token = createToken(mockUser);
      
      expect(() => {
        jwt.decode(token, secret);
      }).not.toThrow();
    });

    it('should fail to decode with wrong secret', () => {
      const token = createToken(mockUser);
      
      expect(() => {
        jwt.decode(token, 'wrong_secret');
      }).toThrow();
    });

    it('should handle user without some optional fields', () => {
      const minimalUser = {
        _id: '507f1f77bcf86cd799439013',
        name: 'Minimal',
        email: 'minimal@example.com'
      };

      const token = createToken(minimalUser);
      const decoded = jwt.decode(token, secret);

      expect(decoded.id).toBe(minimalUser._id);
      expect(decoded.name).toBe(minimalUser.name);
      expect(decoded.email).toBe(minimalUser.email);
      expect(decoded.nickname).toBeUndefined();
      expect(decoded.role).toBeUndefined();
      expect(decoded.image).toBeUndefined();
    });
  });

  describe('secret', () => {
    it('should export the secret', () => {
      expect(secret).toBeDefined();
      expect(typeof secret).toBe('string');
      expect(secret).toBe('clave_secreta_net');
    });
  });
});