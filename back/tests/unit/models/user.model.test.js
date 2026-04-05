import { describe, it, expect, beforeEach } from 'vitest';
import User from '../../../models/user.model.js';
import { createTestUser, createTestTattooer } from '../../helpers/testHelpers.js';
import mongoose from 'mongoose';

describe('User Model', () => {
  describe('User Creation', () => {
    it('should create a user with required fields', async () => {
      const userData = {
        email: 'test@test.com',
        password: 'hashedPassword123',
        userType: 'client',
        nom: 'Test User',
        localisation: 'Paris',
      };

      const user = await User.create(userData);

      expect(user._id).toBeDefined();
      expect(user.email).toBe('test@test.com');
      expect(user.userType).toBe('client');
      expect(user.nom).toBe('Test User');
    });

    it('should initialize preferences on creation', async () => {
      const user = await createTestUser();

      expect(user.preferences).toBeDefined();
      expect(user.preferences.maxDistance).toBe(50);
      expect(user.preferences.minRating).toBe(4.0);
      expect(user.preferences.notifications).toBeDefined();
    });

    it('should initialize empty arrays for saved content', async () => {
      const user = await createTestUser();

      expect(Array.isArray(user.savedPosts)).toBe(true);
      expect(Array.isArray(user.savedFlashs)).toBe(true);
      expect(Array.isArray(user.following)).toBe(true);
      expect(user.savedPosts).toHaveLength(0);
    });

    it('should trim whitespace from string fields', async () => {
      const user = await User.create({
        email: 'test@test.com',
        password: 'password123',
        nom: '  Jean Dupont  ',
        localisation: '  Paris  ',
        bio: '  Bio text  ',
      });

      expect(user.nom).toBe('Jean Dupont');
      expect(user.localisation).toBe('Paris');
      expect(user.bio).toBe('Bio text');
    });
  });

  describe('Flash Save Methods', () => {
    let user;
    const flashId1 = new mongoose.Types.ObjectId();
    const flashId2 = new mongoose.Types.ObjectId();

    beforeEach(async () => {
      user = await createTestUser();
    });

    it('should check if flash is saved', () => {
      user.savedFlashs = [flashId1];
      
      expect(user.isFlashSaved(flashId1)).toBe(true);
      expect(user.isFlashSaved(flashId2)).toBe(false);
    });

    it('should toggle save flash (add)', async () => {
      const result = user.toggleSaveFlash(flashId1);

      expect(result.saved).toBe(true);
      expect(result.action).toBe('added');
      expect(user.savedFlashs).toHaveLength(1);
      expect(user.savedFlashs[0].toString()).toBe(flashId1.toString());
    });

    it('should toggle save flash (remove)', async () => {
      user.savedFlashs = [flashId1];
      
      const result = user.toggleSaveFlash(flashId1);

      expect(result.saved).toBe(false);
      expect(result.action).toBe('removed');
      expect(user.savedFlashs).toHaveLength(0);
    });

    it('should not add duplicate flashs', async () => {
      user.savedFlashs = [flashId1];
      await user.save();

      user.savedFlashs.push(flashId1);
      await user.save();

      const savedUser = await User.findById(user._id);
      expect(savedUser.savedFlashs).toHaveLength(1);
    });
  });

  describe('Post Save Methods', () => {
    let user;
    const postId1 = new mongoose.Types.ObjectId();
    const postId2 = new mongoose.Types.ObjectId();

    beforeEach(async () => {
      user = await createTestUser();
    });

    it('should check if post is saved', () => {
      user.savedPosts = [postId1];
      
      expect(user.isPostSaved(postId1)).toBe(true);
      expect(user.isPostSaved(postId2)).toBe(false);
    });

    it('should toggle save post', async () => {
      const addResult = user.toggleSavePost(postId1);
      expect(addResult.saved).toBe(true);
      expect(user.savedPosts).toHaveLength(1);

      const removeResult = user.toggleSavePost(postId1);
      expect(removeResult.saved).toBe(false);
      expect(user.savedPosts).toHaveLength(0);
    });
  });

  describe('Follow Methods', () => {
    let user;
    let tattooer;

    beforeEach(async () => {
      user = await createTestUser();
      tattooer = await createTestTattooer();
    });

    it('should check if following user', () => {
      user.following = [tattooer._id];
      
      expect(user.isFollowing(tattooer._id)).toBe(true);
    });

    it('should toggle follow', async () => {
      const followResult = user.toggleFollow(tattooer._id);
      expect(followResult.following).toBe(true);
      expect(followResult.action).toBe('followed');
      expect(user.following).toHaveLength(1);

      const unfollowResult = user.toggleFollow(tattooer._id);
      expect(unfollowResult.following).toBe(false);
      expect(unfollowResult.action).toBe('unfollowed');
      expect(user.following).toHaveLength(0);
    });
  });

  describe('Virtual Properties', () => {
    let user;

    beforeEach(async () => {
      user = await createTestUser();
    });

    it('should calculate savedPostsCount', () => {
      user.savedPosts = [
        new mongoose.Types.ObjectId(),
        new mongoose.Types.ObjectId(),
      ];
      
      expect(user.savedPostsCount).toBe(2);
    });

    it('should calculate savedFlashsCount', () => {
      user.savedFlashs = [
        new mongoose.Types.ObjectId(),
        new mongoose.Types.ObjectId(),
        new mongoose.Types.ObjectId(),
      ];
      
      expect(user.savedFlashsCount).toBe(3);
    });

    it('should calculate totalSavedContent', () => {
      user.savedPosts = [new mongoose.Types.ObjectId()];
      user.savedFlashs = [
        new mongoose.Types.ObjectId(),
        new mongoose.Types.ObjectId(),
      ];
      
      expect(user.totalSavedContent).toBe(3);
    });

    it('should calculate followingCount', () => {
      user.following = [
        new mongoose.Types.ObjectId(),
        new mongoose.Types.ObjectId(),
      ];
      
      expect(user.followingCount).toBe(2);
    });
  });

  describe('Preferences Methods', () => {
    let user;

    beforeEach(async () => {
      user = await createTestUser();
    });

    it('should update preferences', () => {
      const newPreferences = {
        maxDistance: 100,
        minRating: 4.5,
        verifiedOnly: true,
      };

      user.updatePreferences(newPreferences);

      expect(user.preferences.maxDistance).toBe(100);
      expect(user.preferences.minRating).toBe(4.5);
      expect(user.preferences.verifiedOnly).toBe(true);
      expect(user.preferencesUpdatedAt).toBeDefined();
    });

   it('should check if user has preferences', async () => {
  expect(user.hasPreferences()).toBe(true);
  
  // Les préférences sont toujours définies grâce au middleware
  user.preferences = {};
  expect(user.hasPreferences()).toBe(true);
});
  });

  describe('Recommendation Interactions', () => {
    let user;
    const artistId = new mongoose.Types.ObjectId();

    beforeEach(async () => {
      user = await createTestUser();
    });

    it('should add recommendation interaction', () => {
      const interaction = user.addRecommendationInteraction(
        artistId, 
        'view',
        { source: 'recommendations' }
      );

      expect(interaction).toBeDefined();
      expect(interaction.artistId.toString()).toBe(artistId.toString());
      expect(interaction.interactionType).toBe('view');
      expect(user.recommendationInteractions).toHaveLength(1);
    });

    it('should limit interactions to 100', () => {
      for (let i = 0; i < 120; i++) {
        user.addRecommendationInteraction(artistId, 'view');
      }

      expect(user.recommendationInteractions).toHaveLength(100);
    });
  });

  describe('Validation', () => {
    it('should require email', async () => {
      const user = new User({
        password: 'password123',
      });

      await expect(user.save()).rejects.toThrow();
    });

    it('should require password', async () => {
      const user = new User({
        email: 'test@test.com',
      });

      await expect(user.save()).rejects.toThrow();
    });

    it('should enforce unique email', async () => {
      await createTestUser({ email: 'unique@test.com' });

      const duplicate = new User({
        email: 'unique@test.com',
        password: 'password123',
      });

      await expect(duplicate.save()).rejects.toThrow();
    });

    it('should validate userType enum', async () => {
      const user = new User({
        email: 'test@test.com',
        password: 'password123',
        userType: 'invalid_type',
      });

      await expect(user.save()).rejects.toThrow();
    });
  });

  describe('JSON Serialization', () => {
    it('should not expose password in JSON', async () => {
      const user = await createTestUser();
      const userJson = user.toJSON();

      expect(userJson.password).toBeUndefined();
      expect(userJson.resetToken).toBeUndefined();
      expect(userJson.__v).toBeUndefined();
    });

    it('should include virtual properties in JSON', async () => {
      const user = await createTestUser();
      user.savedPosts = [new mongoose.Types.ObjectId()];
      user.savedFlashs = [new mongoose.Types.ObjectId()];

      const userJson = user.toJSON();

      expect(userJson.savedPostsCount).toBe(1);
      expect(userJson.savedFlashsCount).toBe(1);
      expect(userJson.totalSavedContent).toBe(2);
    });
  });
});