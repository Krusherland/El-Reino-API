const Publication = require('../../Models/publication');
const User = require('../../Models/user');
const mongoose = require('mongoose');

describe('Publication Model', () => {
  let testUser;

  beforeEach(async () => {
    // Create a test user for publication references
    testUser = new User({
      name: 'Test',
      surname: 'User',
      nickname: 'testuser',
      email: 'test@example.com',
      password: 'hashedpassword'
    });
    await testUser.save();
  });

  describe('Publication Schema Validation', () => {
    it('should create a publication with all required fields', async () => {
      const publicationData = {
        user: testUser._id,
        text: 'This is a test publication'
      };

      const publication = new Publication(publicationData);
      const savedPublication = await publication.save();

      expect(savedPublication._id).toBeDefined();
      expect(savedPublication.user.toString()).toBe(testUser._id.toString());
      expect(savedPublication.text).toBe(publicationData.text);
      expect(savedPublication.created_at).toBeDefined();
      expect(savedPublication.file).toBeUndefined();
    });

    it('should create a publication with file', async () => {
      const publicationData = {
        user: testUser._id,
        text: 'This is a test publication with file',
        file: 'test-image.jpg'
      };

      const publication = new Publication(publicationData);
      const savedPublication = await publication.save();

      expect(savedPublication.file).toBe(publicationData.file);
      expect(savedPublication.text).toBe(publicationData.text);
      expect(savedPublication.user.toString()).toBe(testUser._id.toString());
    });

    it('should fail to create publication without text', async () => {
      const publicationData = {
        user: testUser._id
      };

      const publication = new Publication(publicationData);
      
      let error;
      try {
        await publication.save();
      } catch (err) {
        error = err;
      }

      expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
      expect(error.errors.text).toBeDefined();
    });

    it('should create publication without user reference', async () => {
      // While not ideal, the schema allows this
      const publicationData = {
        text: 'This is a test publication without user'
      };

      const publication = new Publication(publicationData);
      const savedPublication = await publication.save();

      expect(savedPublication.text).toBe(publicationData.text);
      expect(savedPublication.user).toBeUndefined();
    });

    it('should set created_at to current date', async () => {
      const publicationData = {
        user: testUser._id,
        text: 'Test publication for date'
      };

      const beforeSave = new Date();
      const publication = new Publication(publicationData);
      const savedPublication = await publication.save();
      const afterSave = new Date();

      expect(savedPublication.created_at).toBeInstanceOf(Date);
      expect(savedPublication.created_at.getTime()).toBeGreaterThanOrEqual(beforeSave.getTime());
      expect(savedPublication.created_at.getTime()).toBeLessThanOrEqual(afterSave.getTime());
    });

    it('should populate user reference', async () => {
      const publicationData = {
        user: testUser._id,
        text: 'Test publication for population'
      };

      const publication = new Publication(publicationData);
      await publication.save();

      const populatedPublication = await Publication.findById(publication._id).populate('user');

      expect(populatedPublication.user).toBeDefined();
      expect(populatedPublication.user.name).toBe(testUser.name);
      expect(populatedPublication.user.email).toBe(testUser.email);
    });
  });
});