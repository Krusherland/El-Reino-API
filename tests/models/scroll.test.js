const Scroll = require('../../Models/scroll');
const User = require('../../Models/user');
const mongoose = require('mongoose');

describe('Scroll Model', () => {
  let testUser;

  beforeEach(async () => {
    // Create a test user for scroll references
    testUser = new User({
      name: 'Test',
      surname: 'User',
      nickname: 'testuser',
      email: 'test@example.com',
      password: 'hashedpassword'
    });
    await testUser.save();
  });

  describe('Scroll Schema Validation', () => {
    it('should create a scroll with all required fields', async () => {
      const scrollData = {
        user: testUser._id,
        text: 'This is a test scroll'
      };

      const scroll = new Scroll(scrollData);
      const savedScroll = await scroll.save();

      expect(savedScroll._id).toBeDefined();
      expect(savedScroll.user.toString()).toBe(testUser._id.toString());
      expect(savedScroll.text).toBe(scrollData.text);
      expect(savedScroll.created_at).toBeDefined();
      expect(savedScroll.file).toBeUndefined();
    });

    it('should create a scroll with file', async () => {
      const scrollData = {
        user: testUser._id,
        text: 'This is a test scroll with file',
        file: 'test-image.jpg'
      };

      const scroll = new Scroll(scrollData);
      const savedScroll = await scroll.save();

      expect(savedScroll.file).toBe(scrollData.file);
      expect(savedScroll.text).toBe(scrollData.text);
      expect(savedScroll.user.toString()).toBe(testUser._id.toString());
    });

    it('should fail to create scroll without text', async () => {
      const scrollData = {
        user: testUser._id
      };

      const scroll = new Scroll(scrollData);
      
      let error;
      try {
        await scroll.save();
      } catch (err) {
        error = err;
      }

      expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
      expect(error.errors.text).toBeDefined();
    });

    it('should create scroll without user reference', async () => {
      // While not ideal, the schema allows this
      const scrollData = {
        text: 'This is a test scroll without user'
      };

      const scroll = new Scroll(scrollData);
      const savedScroll = await scroll.save();

      expect(savedScroll.text).toBe(scrollData.text);
      expect(savedScroll.user).toBeUndefined();
    });

    it('should set created_at to current date', async () => {
      const scrollData = {
        user: testUser._id,
        text: 'Test scroll for date'
      };

      const beforeSave = new Date();
      const scroll = new Scroll(scrollData);
      const savedScroll = await scroll.save();
      const afterSave = new Date();

      expect(savedScroll.created_at).toBeInstanceOf(Date);
      expect(savedScroll.created_at.getTime()).toBeGreaterThanOrEqual(beforeSave.getTime());
      expect(savedScroll.created_at.getTime()).toBeLessThanOrEqual(afterSave.getTime());
    });

    it('should populate user reference', async () => {
      const scrollData = {
        user: testUser._id,
        text: 'Test scroll for population'
      };

      const scroll = new Scroll(scrollData);
      await scroll.save();

      const populatedScroll = await Scroll.findById(scroll._id).populate('user');

      expect(populatedScroll.user).toBeDefined();
      expect(populatedScroll.user.name).toBe(testUser.name);
      expect(populatedScroll.user.email).toBe(testUser.email);
    });
  });
});