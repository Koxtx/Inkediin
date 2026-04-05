import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import app from '../../../index.js';
import User from '../../../models/user.model.js';
import {
  createTestUser,
  createTestTattooer,
  generateAuthToken,
  createMockFile
} from '../../helpers/testHelpers.js';
import bcrypt from 'bcrypt';

// Mock Cloudinary
vi.mock('cloudinary', () => ({
  v2: {
    config: vi.fn(),
    uploader: {
      upload: vi.fn().mockResolvedValue({
        secure_url: 'https://cloudinary.com/test-image.jpg',
        public_id: 'test-public-id'
      }),
      destroy: vi.fn().mockResolvedValue({ result: 'ok' })
    }
  }
}));

// Mock SendGrid
vi.mock('@sendgrid/mail', () => ({
  default: {
    setApiKey: vi.fn(),
    send: vi.fn().mockResolvedValue([{ statusCode: 202 }])
  }
}));

describe('User Routes - Authentication', () => {
  describe('POST /api/users (signup)', () => {
    it('should create temp user and send confirmation email', async () => {
      const userData = {
        email: 'newuser@test.com',
        password: 'Test123!'
      };

      const response = await request(app)
        .post('/api/users')
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('confirmer');
    });

    it('should reject if email already registered', async () => {
      const user = await createTestUser({ email: 'existing@test.com' });

      const response = await request(app)
        .post('/api/users')
        .send({
          email: 'existing@test.com',
          password: 'Test123!'
        })
        .expect(400);

      expect(response.body.message).toContain('Déjà inscrit');
    });
  });

  describe('POST /api/users/signin', () => {
    it('should login with valid credentials', async () => {
      const password = 'Test123!';
      const user = await createTestUser({ 
        email: 'user@test.com',
        password: await bcrypt.hash(password, 10)
      });

      const response = await request(app)
        .post('/api/users/signin')
        .send({
          email: 'user@test.com',
          password
        })
        .expect(200);

      expect(response.body).toHaveProperty('_id');
      expect(response.body.email).toBe('user@test.com');
      expect(response.body).not.toHaveProperty('password');
      expect(response.headers['set-cookie']).toBeDefined();
    });

    it('should reject invalid credentials', async () => {
      await createTestUser({ email: 'user@test.com' });

      const response = await request(app)
        .post('/api/users/signin')
        .send({
          email: 'user@test.com',
          password: 'WrongPassword'
        })
        .expect(400);

      expect(response.body.message).toContain('incorrect');
    });

    it('should reject non-existent user', async () => {
      const response = await request(app)
        .post('/api/users/signin')
        .send({
          email: 'notfound@test.com',
          password: 'Test123!'
        })
        .expect(400);

      expect(response.body.message).toContain('incorrect');
    });
  });
});

describe('User Routes - Profile Management', () => {
  let authUser;
  let authToken;

  beforeEach(async () => {
    authUser = await createTestUser();
    authToken = generateAuthToken(authUser._id);
  });

  describe('GET /api/users/currentUser', () => {
    it('should return current user when authenticated', async () => {
      const response = await request(app)
        .get('/api/users/currentUser')
        .set('Cookie', [`token=${authToken}`])
        .expect(200);

      expect(response.body._id).toBe(authUser._id.toString());
      expect(response.body.email).toBe(authUser.email);
      expect(response.body).not.toHaveProperty('password');
    });

    it('should return 401 without token', async () => {
      await request(app)
        .get('/api/users/currentUser')
        .expect(401);
    });
  });

  describe('POST /api/users/completeProfile', () => {
    it('should complete profile for client', async () => {
      const incompleteUser = await createTestUser({ 
        isProfileCompleted: false,
        userType: null 
      });
      const token = generateAuthToken(incompleteUser._id);

      const response = await request(app)
        .post('/api/users/completeProfile')
        .set('Cookie', [`token=${token}`])
        .send({
          userType: 'client',
          nom: 'Jean Dupont',
          localisation: 'Paris'
        })
        .expect(200);

      expect(response.body.userType).toBe('client');
      expect(response.body.nom).toBe('Jean Dupont');
      expect(response.body.isProfileCompleted).toBe(true);
    });

    it('should complete profile for tatoueur with additional fields', async () => {
      const incompleteUser = await createTestUser({ 
        isProfileCompleted: false,
        userType: null 
      });
      const token = generateAuthToken(incompleteUser._id);

      const response = await request(app)
        .post('/api/users/completeProfile')
        .set('Cookie', [`token=${token}`])
        .send({
          userType: 'tatoueur',
          nom: 'Marie Artiste',
          localisation: 'Lyon',
          bio: 'Tatoueur professionnel',
          styles: 'Japonais, Traditionnel'
        })
        .expect(200);

      expect(response.body.userType).toBe('tatoueur');
      expect(response.body.bio).toBe('Tatoueur professionnel');
      expect(response.body.styles).toBe('Japonais, Traditionnel');
    });

    it('should reject without required fields', async () => {
      const response = await request(app)
        .post('/api/users/completeProfile')
        .set('Cookie', [`token=${authToken}`])
        .send({
          userType: 'client'
          // manque nom et localisation
        })
        .expect(400);

      expect(response.body.message).toContain('requis');
    });
  });

  describe('DELETE /api/users/account', () => {
    it('should delete user account', async () => {
      const response = await request(app)
        .delete('/api/users/account')
        .set('Cookie', [`token=${authToken}`])
        .expect(200);

      expect(response.body.message).toContain('supprimé');

      const deletedUser = await User.findById(authUser._id);
      expect(deletedUser).toBeNull();
    });
  });
});

describe('User Routes - Follow System', () => {
  let user;
  let tattooer;
  let userToken;

  beforeEach(async () => {
    user = await createTestUser();
    tattooer = await createTestTattooer();
    userToken = generateAuthToken(user._id);
  });

  describe('POST /api/users/:id/follow', () => {
    it('should follow a tattooer', async () => {
      const response = await request(app)
        .post(`/api/users/${tattooer._id}/follow`)
        .set('Cookie', [`token=${userToken}`])
        .expect(200);

      expect(response.body.message).toContain('suivez maintenant');
      expect(response.body.isFollowing).toBe(true);
      expect(response.body.followersCount).toBe(1);

      const updatedUser = await User.findById(user._id);
      expect(updatedUser.following).toContainEqual(tattooer._id);
    });

    it('should prevent following self', async () => {
      const response = await request(app)
        .post(`/api/users/${user._id}/follow`)
        .set('Cookie', [`token=${userToken}`])
        .expect(400);

      expect(response.body.message).toContain('vous-même');
    });

    it('should prevent double follow', async () => {
      await request(app)
        .post(`/api/users/${tattooer._id}/follow`)
        .set('Cookie', [`token=${userToken}`]);

      const response = await request(app)
        .post(`/api/users/${tattooer._id}/follow`)
        .set('Cookie', [`token=${userToken}`])
        .expect(400);

      expect(response.body.message).toContain('déjà');
    });
  });

  describe('DELETE /api/users/:id/unfollow', () => {
    beforeEach(async () => {
      await request(app)
        .post(`/api/users/${tattooer._id}/follow`)
        .set('Cookie', [`token=${userToken}`]);
    });

    it('should unfollow a tattooer', async () => {
      const response = await request(app)
        .delete(`/api/users/${tattooer._id}/unfollow`)
        .set('Cookie', [`token=${userToken}`])
        .expect(200);

      expect(response.body.message).toContain('ne suivez plus');
      expect(response.body.isFollowing).toBe(false);

      const updatedUser = await User.findById(user._id);
      expect(updatedUser.following).not.toContainEqual(tattooer._id);
    });
  });

  describe('GET /api/users/:id/is-following', () => {
    it('should return true when following', async () => {
      await request(app)
        .post(`/api/users/${tattooer._id}/follow`)
        .set('Cookie', [`token=${userToken}`]);

      const response = await request(app)
        .get(`/api/users/${tattooer._id}/is-following`)
        .set('Cookie', [`token=${userToken}`])
        .expect(200);

      expect(response.body.isFollowing).toBe(true);
    });

    it('should return false when not following', async () => {
      const response = await request(app)
        .get(`/api/users/${tattooer._id}/is-following`)
        .set('Cookie', [`token=${userToken}`])
        .expect(200);

      expect(response.body.isFollowing).toBe(false);
    });
  });
});

describe('User Routes - Saved Content', () => {
  let user;
  let userToken;

  beforeEach(async () => {
    user = await createTestUser();
    userToken = generateAuthToken(user._id);
  });

  describe('POST /api/users/posts/:postId/save', () => {
    it('should return 404 for non-existent post', async () => {
      const fakePostId = '507f1f77bcf86cd799439011';

      const response = await request(app)
        .post(`/api/users/posts/${fakePostId}/save`)
        .set('Cookie', [`token=${userToken}`])
        .expect(404);

      expect(response.body.message).toContain('introuvable');
    });
  });
});

describe('User Routes - Discovery', () => {
  beforeEach(async () => {
    await createTestTattooer({ 
      nom: 'Tattooer 1', 
      localisation: 'Paris',
      styles: 'Japonais'
    });
    await createTestTattooer({ 
      nom: 'Tattooer 2', 
      localisation: 'Lyon',
      styles: 'Traditionnel'
    });
  });

  describe('GET /api/users/tattooers', () => {
    it('should fetch all tattooers', async () => {
      const response = await request(app)
        .get('/api/users/tattooers')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(2);
      expect(response.body[0]).toHaveProperty('userType', 'tatoueur');
    });
  });

  describe('GET /api/users/:id', () => {
    it('should fetch tattooer by id', async () => {
      const tattooer = await createTestTattooer();

      const response = await request(app)
        .get(`/api/users/${tattooer._id}`)
        .expect(200);

      expect(response.body._id).toBe(tattooer._id.toString());
      expect(response.body.nom).toBe(tattooer.nom);
    });

    it('should return 404 for non-existent tattooer', async () => {
      const fakeId = '507f1f77bcf86cd799439011';

      await request(app)
        .get(`/api/users/${fakeId}`)
        .expect(404);
    });
  });
});