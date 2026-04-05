import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useContext } from 'react';
import { BrowserRouter } from 'react-router-dom'; // ✅ Ajoutez cet import
import AuthProvider from '../../../src/components/providers/AuthProvider';
import { AuthContext } from '../../../src/context/AuthContext';
import * as authApi from '../../../src/api/auth.api';

// Mock de l'API
vi.mock('../../../src/api/auth.api');

// ✅ Wrapper avec Router
const wrapper = ({ children }) => (
  <BrowserRouter>
    <AuthProvider>{children}</AuthProvider>
  </BrowserRouter>
);

describe('AuthProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authApi.getCurrentUser.mockResolvedValue(null);
  });

  it('should provide auth context', async () => {
    const { result } = renderHook(() => useContext(AuthContext), { wrapper });

    // Attendre que le loading soit terminé
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current).toHaveProperty('user');
    expect(result.current).toHaveProperty('login');
    expect(result.current).toHaveProperty('logout');
    expect(result.current).toHaveProperty('isAuthenticated');
  });

  it('should login successfully', async () => {
    const mockUser = {
      _id: '123',
      email: 'test@test.com',
      nom: 'Test User',
      userType: 'tatoueur',
      localisation: 'Paris',
      isProfileCompleted: true
    };

    authApi.signin.mockResolvedValue({
      success: true,
      user: mockUser
    });

    const { result } = renderHook(() => useContext(AuthContext), { wrapper });

    // Attendre que le chargement initial soit terminé
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    let loginResult;
    await act(async () => {
      loginResult = await result.current.login({
        email: 'test@test.com',
        password: 'Password123!'
      });
    });

    expect(loginResult.success).toBe(true);
    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('should logout successfully', async () => {
    authApi.signOut.mockResolvedValue();

    const { result } = renderHook(() => useContext(AuthContext), { wrapper });

    // Attendre que le chargement initial soit terminé
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Simuler un utilisateur connecté
    act(() => {
      result.current.updateUser({ 
        _id: '123', 
        nom: 'Test',
        email: 'test@test.com',
        userType: 'tatoueur'
      });
    });

    await waitFor(() => {
      expect(result.current.user).not.toBeNull();
    });

    await act(async () => {
      await result.current.logout();
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('should check if first login', async () => {
    const { result } = renderHook(() => useContext(AuthContext), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const incompleteUser = {
      _id: '123',
      email: 'test@test.com',
      isProfileCompleted: false
    };

    const isFirstLogin = result.current.checkIsFirstLogin(incompleteUser);
    expect(isFirstLogin).toBe(true);

    const completeUser = {
      _id: '123',
      email: 'test@test.com',
      nom: 'Test User',
      userType: 'tatoueur',
      localisation: 'Paris',
      isProfileCompleted: true
    };

    const isNotFirstLogin = result.current.checkIsFirstLogin(completeUser);
    expect(isNotFirstLogin).toBe(false);
  });
});