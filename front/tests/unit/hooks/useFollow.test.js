import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useFollow } from '../../../src/hooks/useFollow';
import * as authApi from '../../../src/api/auth.api';

// Mock de l'API
vi.mock('../../../src/api/auth.api');

// Mock de toast
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  }
}));

describe('useFollow', () => {
  const userId = '123';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with correct default values', async () => {
    authApi.checkIfFollowing.mockResolvedValue({
      success: true,
      isFollowing: false,
      followersCount: 0
    });

    const { result } = renderHook(() => useFollow(userId));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.isFollowing).toBe(false);
    expect(result.current.followersCount).toBe(0);
    expect(result.current.error).toBeNull();
  });

  it('should check follow status on mount', async () => {
    authApi.checkIfFollowing.mockResolvedValue({
      success: true,
      isFollowing: true,
      followersCount: 10
    });

    const { result } = renderHook(() => useFollow(userId));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(authApi.checkIfFollowing).toHaveBeenCalledWith(userId);
    expect(result.current.isFollowing).toBe(true);
    expect(result.current.followersCount).toBe(10);
  });

  it('should follow user successfully', async () => {
    authApi.checkIfFollowing.mockResolvedValue({
      success: true,
      isFollowing: false,
      followersCount: 10
    });

    authApi.followUser.mockResolvedValue({
      success: true,
      isFollowing: true,
      followersCount: 11,
      message: 'Utilisateur suivi'
    });

    const { result } = renderHook(() => useFollow(userId));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    let followResult;
    await act(async () => {
      followResult = await result.current.toggleFollow();
    });

    expect(followResult.success).toBe(true);
    expect(result.current.isFollowing).toBe(true);
    expect(result.current.followersCount).toBe(11);
  });

  it('should unfollow user successfully', async () => {
    authApi.checkIfFollowing.mockResolvedValue({
      success: true,
      isFollowing: true,
      followersCount: 11
    });

    authApi.unfollowUser.mockResolvedValue({
      success: true,
      isFollowing: false,
      followersCount: 10,
      message: 'Vous ne suivez plus cet utilisateur'
    });

    const { result } = renderHook(() => useFollow(userId));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    let unfollowResult;
    await act(async () => {
      unfollowResult = await result.current.toggleFollow();
    });

    expect(unfollowResult.success).toBe(true);
    expect(result.current.isFollowing).toBe(false);
    expect(result.current.followersCount).toBe(10);
  });

  it('should handle follow error', async () => {
    authApi.checkIfFollowing.mockResolvedValue({
      success: true,
      isFollowing: false
    });

    authApi.followUser.mockResolvedValue({
      success: false,
      message: 'Erreur lors du suivi'
    });

    const { result } = renderHook(() => useFollow(userId));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    let followResult;
    await act(async () => {
      followResult = await result.current.toggleFollow();
    });

    expect(followResult.success).toBe(false);
    expect(result.current.error).toBeTruthy();
  });

  it('should provide correct action text', async () => {
    authApi.checkIfFollowing.mockResolvedValue({
      success: true,
      isFollowing: false
    });

    const { result } = renderHook(() => useFollow(userId));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.getActionText()).toBe('Suivre');

    act(() => {
      result.current.setFollowStatus(true);
    });

    expect(result.current.getActionText()).toBe('Suivi');
  });

  it('should refresh follow status', async () => {
    authApi.checkIfFollowing.mockResolvedValue({
      success: true,
      isFollowing: false,
      followersCount: 10
    });

    const { result } = renderHook(() => useFollow(userId));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    authApi.checkIfFollowing.mockResolvedValue({
      success: true,
      isFollowing: true,
      followersCount: 11
    });

    await act(async () => {
      await result.current.refreshFollowStatus();
    });

    expect(result.current.isFollowing).toBe(true);
    expect(result.current.followersCount).toBe(11);
  });
});