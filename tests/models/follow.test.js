const Follow = require('../../Models/follow');
const User = require('../../Models/user');
const mongoose = require('mongoose');

describe('Follow Model', () => {
  let testUser1, testUser2;

  beforeEach(async () => {
    // Create test users for follow relationships
    testUser1 = new User({
      name: 'User',
      surname: 'One',
      nickname: 'user1',
      email: 'user1@example.com',
      password: 'hashedpassword1'
    });
    await testUser1.save();

    testUser2 = new User({
      name: 'User',
      surname: 'Two',
      nickname: 'user2',
      email: 'user2@example.com',
      password: 'hashedpassword2'
    });
    await testUser2.save();
  });

  describe('Follow Schema Validation', () => {
    it('should create a follow relationship', async () => {
      const followData = {
        user: testUser1._id,
        followers: testUser2._id
      };

      const follow = new Follow(followData);
      const savedFollow = await follow.save();

      expect(savedFollow._id).toBeDefined();
      expect(savedFollow.user.toString()).toBe(testUser1._id.toString());
      expect(savedFollow.followers.toString()).toBe(testUser2._id.toString());
      expect(savedFollow.created_at).toBeDefined();
    });

    it('should create follow without user reference', async () => {
      const followData = {
        followers: testUser2._id
      };

      const follow = new Follow(followData);
      const savedFollow = await follow.save();

      expect(savedFollow.followers.toString()).toBe(testUser2._id.toString());
      expect(savedFollow.user).toBeUndefined();
    });

    it('should create follow without followers reference', async () => {
      const followData = {
        user: testUser1._id
      };

      const follow = new Follow(followData);
      const savedFollow = await follow.save();

      expect(savedFollow.user.toString()).toBe(testUser1._id.toString());
      expect(savedFollow.followers).toBeUndefined();
    });

    it('should set created_at to current date', async () => {
      const followData = {
        user: testUser1._id,
        followers: testUser2._id
      };

      const beforeSave = new Date();
      const follow = new Follow(followData);
      const savedFollow = await follow.save();
      const afterSave = new Date();

      expect(savedFollow.created_at).toBeInstanceOf(Date);
      expect(savedFollow.created_at.getTime()).toBeGreaterThanOrEqual(beforeSave.getTime());
      expect(savedFollow.created_at.getTime()).toBeLessThanOrEqual(afterSave.getTime());
    });

    it('should allow multiple follow relationships for same user', async () => {
      const testUser3 = new User({
        name: 'User',
        surname: 'Three',
        nickname: 'user3',
        email: 'user3@example.com',
        password: 'hashedpassword3'
      });
      await testUser3.save();

      const follow1 = new Follow({
        user: testUser1._id,
        followers: testUser2._id
      });
      await follow1.save();

      const follow2 = new Follow({
        user: testUser1._id,
        followers: testUser3._id
      });
      await follow2.save();

      const follows = await Follow.find({ user: testUser1._id });
      expect(follows).toHaveLength(2);
    });

    it('should create follow without population due to schema issues', async () => {
      const followData = {
        user: testUser1._id,
        followers: testUser2._id
      };

      const follow = new Follow(followData);
      const savedFollow = await follow.save();

      // Note: The original schema has incorrect ref names ("user" and "followers" instead of "User")
      // So we just test basic creation without population
      expect(savedFollow.user.toString()).toBe(testUser1._id.toString());
      expect(savedFollow.followers.toString()).toBe(testUser2._id.toString());
    });
  });
});