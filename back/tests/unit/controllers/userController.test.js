import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  toggleSaveFlash,
  toggleSavePost,
  followUser,
  unfollowUser,
  getSuggestedTattooers,
} from '../../../controllers/user.controllers.js';
import User from '../../../models/user.model.js';
import {
  createTestUser,
  createTestTattooer,
  createMockExpressObjects,
} from '../../helpers/testHelpers.js';
import mongoose from 'mongoose';

// describe('User Controllers - Saved Content', () => {
//   // ⏸️ COMMENTEZ CE BLOC pour l'instant
//   /*
//   describe('toggleSaveFlash', () => {
//     it('should save a flash', async () => { ... });
//   });
  
//   describe('toggleSavePost', () => {
//     it('should save a post', async () => { ... });
//     it('should unsave a post', async () => { ... });
//   });
//   */
// });

describe('User Controllers - Follow System', () => {
  let req, res, next;

  beforeEach(() => {
    const mocks = createMockExpressObjects();
    req = mocks.req;
    res = mocks.res;
    next = mocks.next;
  });

  describe('followUser', () => {
    it('should follow a user successfully', async () => {
      const user = await createTestUser();
      const tattooer = await createTestTattooer();

      req.user = user;
      req.params = { id: tattooer._id.toString() };

      await followUser(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          isFollowing: true,
          followersCount: 1,
        })
      );

      const updatedUser = await User.findById(user._id);
      expect(updatedUser.following).toHaveLength(1);

      const updatedTattooer = await User.findById(tattooer._id);
      expect(updatedTattooer.tatoueursSuivis).toHaveLength(1);
    });

    it('should prevent following self', async () => {
      const user = await createTestUser();

      req.user = user;
      req.params = { id: user._id.toString() };

      await followUser(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('vous-même'),
        })
      );
    });

    it('should prevent double follow', async () => {
      const user = await createTestUser();
      const tattooer = await createTestTattooer();
      
      user.following = [tattooer._id];
      await user.save();

      req.user = user;
      req.params = { id: tattooer._id.toString() };

      await followUser(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('déjà'),
        })
      );
    });

    it('should return 404 if target user not found', async () => {
      const user = await createTestUser();
      const fakeId = new mongoose.Types.ObjectId();

      req.user = user;
      req.params = { id: fakeId.toString() };

      await followUser(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe('unfollowUser', () => {
    it('should unfollow a user successfully', async () => {
      const user = await createTestUser();
      const tattooer = await createTestTattooer();

      user.following = [tattooer._id];
      tattooer.tatoueursSuivis = [user._id];
      await user.save();
      await tattooer.save();

      req.user = user;
      req.params = { id: tattooer._id.toString() };

      await unfollowUser(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          isFollowing: false,
        })
      );

      const updatedUser = await User.findById(user._id);
      expect(updatedUser.following).toHaveLength(0);
    });

    it('should return error if not following', async () => {
      const user = await createTestUser();
      const tattooer = await createTestTattooer();

      req.user = user;
      req.params = { id: tattooer._id.toString() };

      await unfollowUser(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });
});

describe('User Controllers - Discovery', () => {
  let req, res, next;

  beforeEach(async () => {
    const mocks = createMockExpressObjects();
    req = mocks.req;
    res = mocks.res;
    next = mocks.next;

    // Créer des tatoueurs de test
    await createTestTattooer({
      nom: 'Tattooer Paris',
      localisation: 'Paris',
      styles: 'Japonais, Traditionnel',
    });
    await createTestTattooer({
      nom: 'Tattooer Lyon',
      localisation: 'Lyon',
      styles: 'Réaliste',
    });
    await createTestTattooer({
      nom: 'Tattooer Paris 2',
      localisation: 'Paris',
      styles: 'Minimaliste',
    });
  });

  describe('getSuggestedTattooers', () => {
    it('should return suggested tattooers', async () => {
      const user = await createTestUser();
      req.user = user;
      req.query = { limit: '10' };

      await getSuggestedTattooers(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalled();

      const responseData = res.json.mock.calls[0][0];
      expect(responseData.suggestions).toBeDefined();
      expect(Array.isArray(responseData.suggestions)).toBe(true);
      expect(responseData.suggestions.length).toBeGreaterThan(0);
    });

    it('should filter by location', async () => {
      const user = await createTestUser();
      req.user = user;
      req.query = { location: 'Paris', limit: '10' };

      await getSuggestedTattooers(req, res);

      const responseData = res.json.mock.calls[0][0];
      const suggestions = responseData.suggestions;

      expect(suggestions.length).toBeGreaterThan(0);
      suggestions.forEach(tattooer => {
        expect(
          tattooer.localisation.includes('Paris') || 
          tattooer.ville?.includes('Paris')
        ).toBe(true);
      });
    });

    it('should filter by styles', async () => {
      const user = await createTestUser();
      req.user = user;
      req.query = { styles: 'Japonais', limit: '10' };

      await getSuggestedTattooers(req, res);

      const responseData = res.json.mock.calls[0][0];
      const suggestions = responseData.suggestions;

      expect(suggestions.length).toBeGreaterThan(0);
    });

    it('should exclude already followed tattooers', async () => {
      const user = await createTestUser();
      const tattooer = await createTestTattooer({ nom: 'Already Followed' });
      
      user.following = [tattooer._id];
      await user.save();

      req.user = user;
      req.query = { limit: '10' };

      await getSuggestedTattooers(req, res);

      const responseData = res.json.mock.calls[0][0];
      const suggestions = responseData.suggestions;

      const alreadyFollowedInSuggestions = suggestions.some(
        s => s._id.toString() === tattooer._id.toString()
      );
      expect(alreadyFollowedInSuggestions).toBe(false);
    });

    it('should exclude self from suggestions', async () => {
      const tattooer = await createTestTattooer();
      req.user = tattooer;
      req.query = { limit: '10' };

      await getSuggestedTattooers(req, res);

      const responseData = res.json.mock.calls[0][0];
      const suggestions = responseData.suggestions;

      const selfInSuggestions = suggestions.some(
        s => s._id.toString() === tattooer._id.toString()
      );
      expect(selfInSuggestions).toBe(false);
    });

    it('should include match reason', async () => {
      const user = await createTestUser();
      req.user = user;
      req.query = { limit: '10' };

      await getSuggestedTattooers(req, res);

      const responseData = res.json.mock.calls[0][0];
      const suggestions = responseData.suggestions;

      suggestions.forEach(tattooer => {
        expect(tattooer.matchReason).toBeDefined();
        expect(typeof tattooer.matchReason).toBe('string');
      });
    });

    it('should respect limit parameter', async () => {
      const user = await createTestUser();
      req.user = user;
      req.query = { limit: '2' };

      await getSuggestedTattooers(req, res);

      const responseData = res.json.mock.calls[0][0];
      expect(responseData.suggestions.length).toBeLessThanOrEqual(2);
    });
  });
});