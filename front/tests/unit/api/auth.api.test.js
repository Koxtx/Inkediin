import { describe, it, expect, vi, beforeEach } from 'vitest';
import { signin, signup, getCurrentUser, normalizeUserData } from '../../../src/api/auth.api';

// Mock de fetch
global.fetch = vi.fn();

describe('auth.api', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('normalizeUserData', () => {
    it('should normalize user data correctly', () => {
      const rawUser = {
        _id: '123',
        email: 'test@test.com',
        nom: 'Test User',
        photoProfil: 'http://example.com/photo.jpg'
      };

      const normalized = normalizeUserData(rawUser);

      expect(normalized).toHaveProperty('_id', '123');
      expect(normalized).toHaveProperty('id', '123');
      expect(normalized).toHaveProperty('email', 'test@test.com');
      expect(normalized).toHaveProperty('nom', 'Test User');
      expect(normalized).toHaveProperty('photoProfil', 'http://example.com/photo.jpg');
    });

    it('should return null for null input', () => {
      const result = normalizeUserData(null);
      expect(result).toBeNull();
    });

    it('should provide fallback values', () => {
      const rawUser = {
        _id: '123',
        email: 'test@test.com'
      };

      const normalized = normalizeUserData(rawUser);

      expect(normalized.nom).toBe('Utilisateur');
      expect(normalized.userType).toBe('tatoueur');
    });
  });

  describe('signup', () => {
    it('should signup successfully', async () => {
      const mockResponse = {
        success: true,
        message: 'Inscription réussie'
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await signup({
        email: 'test@test.com',
        password: 'Password123!'
      });

      expect(result.success).toBe(true);
      expect(result.message).toBe('Inscription réussie');
    });

    it('should handle signup error', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'Email déjà utilisé' })
      });

      const result = await signup({
        email: 'existing@test.com',
        password: 'Password123!'
      });

      expect(result.success).toBe(false);
      expect(result.message).toContain('Email déjà utilisé');
    });
  });

  describe('signin', () => {
    it('should signin successfully', async () => {
      const mockUser = {
        _id: '123',
        email: 'test@test.com',
        nom: 'Test User',
        userType: 'tatoueur'
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockUser
      });

      const result = await signin({
        email: 'test@test.com',
        password: 'Password123!'
      });

      expect(result.success).toBe(true);
      expect(result.user).toBeDefined();
      expect(result.user.email).toBe('test@test.com');
    });
  });
});