const request = require('supertest');
const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../../Models/user');
const Publication = require('../../Models/publication');
const publicationController = require('../../Controllers/publication');

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
app.get('/test', publicationController.pruebaPublication);
app.post('/save', mockAuth, publicationController.save);
app.get('/detail/:id', publicationController.detail);
app.delete('/remove/:id', mockAuth, publicationController.remove);
app.get('/user/:id/:page', publicationController.publications);
app.get('/user/:id', publicationController.publications);
app.get('/feed/:page', mockAuth, publicationController.feed);
app.get('/feed', mockAuth, publicationController.feed);

describe('Publication Controller', () => {
  let testUser;

  beforeEach(async () => {
    testUser = new User({
      _id: '507f1f77bcf86cd799439011', // Same as mock auth
      name: 'Test',
      surname: 'User',
      nickname: 'testuser',
      email: 'test@example.com',
      password: await bcrypt.hash('password123', 10)
    });
    await testUser.save();
  });

  describe('pruebaPublication', () => {
    it('should return success message', async () => {
      const response = await request(app)
        .get('/test')
        .expect(200);

      expect(response.body.message).toBe('Publication endpoint working');
    });
  });

  describe('save', () => {
    it('should save a publication successfully', async () => {
      const publicationData = {
        text: 'This is a test publication'
      };

      const response = await request(app)
        .post('/save')
        .send(publicationData)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('Publication saved successfully');
      expect(response.body.publication).toBeDefined();
      expect(response.body.publication.text).toBe(publicationData.text);
      expect(response.body.publication.user).toBe(testUser._id.toString());
    });

    it('should fail without text', async () => {
      const publicationData = {};

      const response = await request(app)
        .post('/save')
        .send(publicationData)
        .expect(400);

      expect(response.body.message).toBe('You must send the text of the publication');
    });

    it('should save publication with empty text', async () => {
      const publicationData = {
        text: ''
      };

      const response = await request(app)
        .post('/save')
        .send(publicationData)
        .expect(400);

      expect(response.body.message).toBe('You must send the text of the publication');
    });

    it('should automatically set user from auth', async () => {
      const publicationData = {
        text: 'Test publication with auto user',
        user: '507f1f77bcf86cd799439999' // This should be overridden
      };

      const response = await request(app)
        .post('/save')
        .send(publicationData)
        .expect(200);

      expect(response.body.publication.user).toBe(testUser._id.toString());
    });
  });

  describe('detail', () => {
    let testPublication;

    beforeEach(async () => {
      testPublication = new Publication({
        user: testUser._id,
        text: 'Test publication for detail'
      });
      await testPublication.save();
    });

    it('should return publication details', async () => {
      const response = await request(app)
        .get(`/detail/${testPublication._id}`)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('Detail of publication');
      expect(response.body.publication).toBeDefined();
      expect(response.body.publication.text).toBe(testPublication.text);
      expect(response.body.publication._id).toBe(testPublication._id.toString());
    });

    it('should return 404 for non-existent publication', async () => {
      const fakeId = '507f1f77bcf86cd799439999';
      
      const response = await request(app)
        .get(`/detail/${fakeId}`)
        .expect(404);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Publication not found');
    });

    it('should handle invalid publication ID', async () => {
      const invalidId = 'invalid-id';
      
      const response = await request(app)
        .get(`/detail/${invalidId}`)
        .expect(500);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Error fetching publication');
    });
  });

  describe('remove', () => {
    let testPublication;

    beforeEach(async () => {
      testPublication = new Publication({
        user: testUser._id,
        text: 'Test publication for removal'
      });
      await testPublication.save();
    });

    it('should remove publication successfully', async () => {
      const response = await request(app)
        .delete(`/remove/${testPublication._id}`)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('Publication removed successfully');
      expect(response.body.publication).toBeDefined();

      // Verify publication was actually deleted
      const deletedPublication = await Publication.findById(testPublication._id);
      expect(deletedPublication).toBeNull();
    });

    it('should fail to remove non-existent publication', async () => {
      const fakeId = '507f1f77bcf86cd799439999';
      
      const response = await request(app)
        .delete(`/remove/${fakeId}`)
        .expect(404);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Publication not found or you don\'t have permission to delete it');
    });

    it('should fail to remove publication of another user', async () => {
      // Create another user and their publication
      const anotherUser = new User({
        name: 'Another',
        surname: 'User',
        nickname: 'another',
        email: 'another@example.com',
        password: await bcrypt.hash('password123', 10)
      });
      await anotherUser.save();

      const anotherPublication = new Publication({
        user: anotherUser._id,
        text: 'Another user publication'
      });
      await anotherPublication.save();

      const response = await request(app)
        .delete(`/remove/${anotherPublication._id}`)
        .expect(404);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Publication not found or you don\'t have permission to delete it');

      // Verify publication still exists
      const stillExists = await Publication.findById(anotherPublication._id);
      expect(stillExists).not.toBeNull();
    });
  });

  describe('publications', () => {
    beforeEach(async () => {
      // Create multiple publications for the test user
      const publications = [];
      for (let i = 1; i <= 10; i++) {
        publications.push({
          user: testUser._id,
          text: `Test publication ${i}`
        });
      }
      await Publication.insertMany(publications);
    });

    it('should return paginated publications for user', async () => {
      const response = await request(app)
        .get(`/user/${testUser._id}/1`)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('List of publications');
      expect(response.body.publications).toBeDefined();
      expect(response.body.publications.length).toBeLessThanOrEqual(5); // itemsPerPage = 5
      expect(response.body.total).toBe(10);
      expect(response.body.pages).toBe(2);
      expect(response.body.page).toBe(1);
    });

    it('should return second page correctly', async () => {
      const response = await request(app)
        .get(`/user/${testUser._id}/2`)
        .expect(200);

      expect(response.body.page).toBe(2);
      expect(response.body.publications.length).toBeLessThanOrEqual(5);
    });

    it('should default to page 1 when no page specified', async () => {
      const response = await request(app)
        .get(`/user/${testUser._id}`)
        .expect(200);

      expect(response.body.page).toBe(1);
    });

    it('should return 404 for user with no publications', async () => {
      const anotherUser = new User({
        name: 'No',
        surname: 'Pubs',
        nickname: 'nopubs',
        email: 'nopubs@example.com',
        password: await bcrypt.hash('password123', 10)
      });
      await anotherUser.save();

      const response = await request(app)
        .get(`/user/${anotherUser._id}/1`)
        .expect(404);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('No publications found');
    });

    it('should populate user data in publications', async () => {
      const response = await request(app)
        .get(`/user/${testUser._id}/1`)
        .expect(200);

      expect(response.body.publications[0].user).toBeDefined();
      expect(response.body.publications[0].user.name).toBe(testUser.name);
      expect(response.body.publications[0].user.password).toBeUndefined();
      expect(response.body.publications[0].user.role).toBeUndefined();
      expect(response.body.publications[0].user.email).toBeUndefined();
    });

    it('should sort publications by created_at descending', async () => {
      const response = await request(app)
        .get(`/user/${testUser._id}/1`)
        .expect(200);

      const publications = response.body.publications;
      for (let i = 1; i < publications.length; i++) {
        const currentDate = new Date(publications[i].created_at);
        const previousDate = new Date(publications[i - 1].created_at);
        expect(currentDate.getTime()).toBeLessThanOrEqual(previousDate.getTime());
      }
    });
  });

  describe('feed', () => {
    it('should return empty feed when user follows nobody', async () => {
      // Mock followService to return empty following array
      const followService = require('../../Services/followService');
      jest.spyOn(followService, 'followUserId').mockResolvedValue({
        following: []
      });

      const response = await request(app)
        .get('/feed/1')
        .expect(404);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('No publications found in feed');
    });
  });
});