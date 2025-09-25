const User = require('../../Models/user');
const mongoose = require('mongoose');

describe('User Model', () => {
  describe('User Schema Validation', () => {
    it('should create a user with all required fields', async () => {
      const userData = {
        name: 'John',
        surname: 'Doe',
        nickname: 'johndoe',
        email: 'john@example.com',
        password: 'hashedpassword123'
      };

      const user = new User(userData);
      const savedUser = await user.save();

      expect(savedUser._id).toBeDefined();
      expect(savedUser.name).toBe(userData.name);
      expect(savedUser.surname).toBe(userData.surname);
      expect(savedUser.nickname).toBe(userData.nickname);
      expect(savedUser.email).toBe(userData.email);
      expect(savedUser.password).toBe(userData.password);
      expect(savedUser.role).toBe('role_user'); // default value
      expect(savedUser.image).toBe('default.png'); // default value
      expect(savedUser.bio).toBe('Descripción de vos'); // default value
      expect(savedUser.dungeon).toBe('Calabozo'); // default value
      expect(savedUser.created_at).toBeDefined();
    });

    it('should fail to create user without required fields', async () => {
      const user = new User({});
      
      let error;
      try {
        await user.save();
      } catch (err) {
        error = err;
      }

      expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
      expect(error.errors.name).toBeDefined();
      expect(error.errors.surname).toBeDefined();
      expect(error.errors.nickname).toBeDefined();
      expect(error.errors.email).toBeDefined();
      expect(error.errors.password).toBeDefined();
    });

    it('should fail to create user without name', async () => {
      const userData = {
        surname: 'Doe',
        nickname: 'johndoe',
        email: 'john@example.com',
        password: 'hashedpassword123'
      };

      const user = new User(userData);
      
      let error;
      try {
        await user.save();
      } catch (err) {
        error = err;
      }

      expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
      expect(error.errors.name).toBeDefined();
    });

    it('should fail to create user without email', async () => {
      const userData = {
        name: 'John',
        surname: 'Doe',
        nickname: 'johndoe',
        password: 'hashedpassword123'
      };

      const user = new User(userData);
      
      let error;
      try {
        await user.save();
      } catch (err) {
        error = err;
      }

      expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
      expect(error.errors.email).toBeDefined();
    });

    it('should create user with custom values for optional fields', async () => {
      const userData = {
        name: 'Jane',
        surname: 'Smith',
        nickname: 'janesmith',
        email: 'jane@example.com',
        password: 'hashedpassword456',
        bio: 'Custom bio',
        dungeon: 'Custom dungeon',
        role: 'role_admin',
        image: 'custom.png'
      };

      const user = new User(userData);
      const savedUser = await user.save();

      expect(savedUser.bio).toBe(userData.bio);
      expect(savedUser.dungeon).toBe(userData.dungeon);
      expect(savedUser.role).toBe(userData.role);
      expect(savedUser.image).toBe(userData.image);
    });

    it('should set created_at to current date', async () => {
      const userData = {
        name: 'Test',
        surname: 'User',
        nickname: 'testuser',
        email: 'test@example.com',
        password: 'hashedpassword789'
      };

      const beforeSave = new Date();
      const user = new User(userData);
      const savedUser = await user.save();
      const afterSave = new Date();

      expect(savedUser.created_at).toBeInstanceOf(Date);
      expect(savedUser.created_at.getTime()).toBeGreaterThanOrEqual(beforeSave.getTime());
      expect(savedUser.created_at.getTime()).toBeLessThanOrEqual(afterSave.getTime());
    });
  });
});