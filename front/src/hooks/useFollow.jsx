// hooks/useFollow.js
import { useState, useEffect, useCallback } from 'react';
import { followUser, unfollowUser, checkIfFollowing } from '../api/auth.api';
import toast from 'react-hot-toast';

export function useFollow(userId, initialFollowState = false) {
  const [isFollowing, setIsFollowing] = useState(initialFollowState);
  const [loading, setLoading] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [error, setError] = useState(null);

  // Vérifier le statut de suivi au chargement
  useEffect(() => {
    const checkFollowStatus = async () => {
      if (!userId) return;

      try {
        setLoading(true);
        const result = await checkIfFollowing(userId);
        
        if (result.success) {
          setIsFollowing(result.isFollowing);
          if (result.followersCount !== undefined) {
            setFollowersCount(result.followersCount);
          }
        } else {
          console.warn('Erreur lors de la vérification du suivi:', result.message);
        }
      } catch (error) {
        console.error('Erreur lors de la vérification du suivi:', error);
        setError('Impossible de vérifier le statut de suivi');
      } finally {
        setLoading(false);
      }
    };

    checkFollowStatus();
  }, [userId]);

  // Fonction pour basculer le suivi
  const toggleFollow = useCallback(async () => {
    if (!userId || loading) {
      console.warn('Tentative de toggle sans userId ou en cours de loading');
      return { success: false, message: 'Action impossible' };
    }

    setLoading(true);
    setError(null);
    
    try {
      let result;
      
      if (isFollowing) {
        
        result = await unfollowUser(userId);
      } else {
       
        result = await followUser(userId);
      }

      if (result.success) {
        setIsFollowing(result.isFollowing);
        
        // Mettre à jour le compteur de followers si fourni
        if (result.followersCount !== undefined) {
          setFollowersCount(result.followersCount);
        }
        
        // Afficher un message de succès (optionnel, peut être désactivé)
        if (result.message && !result.silent) {
          toast.success(result.message);
        }
        
      
        return { 
          success: true, 
          isFollowing: result.isFollowing,
          followersCount: result.followersCount,
          message: result.message
        };
      } else {
        // Afficher l'erreur
        const errorMessage = result.message || 'Erreur lors de l\'action';
        setError(errorMessage);
        toast.error(errorMessage);
        
        console.error('❌ Erreur lors de l\'action de suivi:', result);
        return { success: false, message: errorMessage };
      }
    } catch (error) {
      const errorMessage = 'Une erreur est survenue';
      console.error('💥 Erreur lors du changement de suivi:', error);
      setError(errorMessage);
      toast.error(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [userId, isFollowing, loading]);

  // Fonction pour suivre directement
  const follow = useCallback(async () => {
    if (isFollowing || !userId || loading) {
      console.warn('Tentative de follow alors que déjà suivi ou conditions non remplies');
      return { success: false, message: 'Action impossible' };
    }
    return await toggleFollow();
  }, [isFollowing, userId, loading, toggleFollow]);

  // Fonction pour arrêter de suivre directement
  const unfollow = useCallback(async () => {
    if (!isFollowing || !userId || loading) {
      console.warn('Tentative d\'unfollow alors que pas suivi ou conditions non remplies');
      return { success: false, message: 'Action impossible' };
    }
    return await toggleFollow();
  }, [isFollowing, userId, loading, toggleFollow]);

  // Fonction pour définir manuellement le statut (utile pour les mises à jour externes)
  const setFollowStatus = useCallback((status, count = null) => {
   
    setIsFollowing(status);
    if (count !== null) {
      setFollowersCount(count);
    }
    setError(null);
  }, []);

  // Fonction pour rafraîchir le statut depuis l'API
  const refreshFollowStatus = useCallback(async () => {
    if (!userId) return;

    try {
      setLoading(true);
      const result = await checkIfFollowing(userId);
      
      if (result.success) {
        setIsFollowing(result.isFollowing);
        if (result.followersCount !== undefined) {
          setFollowersCount(result.followersCount);
        }
        setError(null);
        return result;
      } else {
        const errorMessage = result.message || 'Erreur lors de la vérification';
        setError(errorMessage);
        return { success: false, message: errorMessage };
      }
    } catch (error) {
      const errorMessage = 'Erreur lors du rafraîchissement';
      console.error('Erreur lors du rafraîchissement du statut:', error);
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Fonction utilitaire pour obtenir le texte d'action
  const getActionText = useCallback(() => {
    if (loading) return 'Chargement...';
    return isFollowing ? 'Suivi' : 'Suivre';
  }, [loading, isFollowing]);

  // Fonction utilitaire pour obtenir l'icône appropriée
  const getActionIcon = useCallback(() => {
    return isFollowing ? 'UserCheck' : 'UserPlus';
  }, [isFollowing]);

  return {
    
    isFollowing,
    loading,
    followersCount,
    error,
    

    toggleFollow,
    follow,
    unfollow,
    
    
    setFollowStatus,
    refreshFollowStatus,
    getActionText,
    getActionIcon,
    
    
    canFollow: !loading && !isFollowing,
    canUnfollow: !loading && isFollowing,
    hasError: !!error,
    
    
    debug: process.env.NODE_ENV === 'development' ? {
      userId,
      initialFollowState,
      lastError: error
    } : undefined
  };
}

// Hook spécialisé pour les listes d'utilisateurs suivis
export function useFollowList() {
  const [followedUsers, setFollowedUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Charger la liste des utilisateurs suivis
  const loadFollowedUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { getFollowedUsers } = await import('../api/auth.api');
      const result = await getFollowedUsers();
      
      if (result.success) {
        setFollowedUsers(result.data);
        return result;
      } else {
        const errorMessage = result.message || 'Erreur lors du chargement';
        setError(errorMessage);
        return { success: false, message: errorMessage };
      }
    } catch (error) {
      const errorMessage = 'Erreur lors du chargement de la liste';
      console.error('Erreur lors du chargement des utilisateurs suivis:', error);
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Supprimer un utilisateur de la liste locale (après unfollow)
  const removeFromList = useCallback((userId) => {
    setFollowedUsers(prev => prev.filter(user => user._id !== userId && user.id !== userId));
  }, []);

  // Ajouter un utilisateur à la liste locale (après follow)
  const addToList = useCallback((user) => {
    setFollowedUsers(prev => {
      // Éviter les doublons
      const exists = prev.some(u => (u._id || u.id) === (user._id || user.id));
      if (exists) return prev;
      return [user, ...prev];
    });
  }, []);

  useEffect(() => {
    loadFollowedUsers();
  }, [loadFollowedUsers]);

  return {
    followedUsers,
    loading,
    error,
    loadFollowedUsers,
    removeFromList,
    addToList,
    refreshList: loadFollowedUsers,
    count: followedUsers.length
  };
}

// Hook pour les statistiques de suivi
export function useFollowStats(userId) {
  const [stats, setStats] = useState({
    followers: 0,
    following: 0,
    isFollowing: false
  });
  const [loading, setLoading] = useState(false);

  const loadStats = useCallback(async () => {
    if (!userId) return;

    try {
      setLoading(true);
      
      // Charger les stats en parallèle
      const [followersResult, followingResult, statusResult] = await Promise.all([
        import('../api/auth.api').then(api => api.getFollowers(userId)),
        import('../api/auth.api').then(api => api.getFollowedUsers()), 
        import('../api/auth.api').then(api => api.checkIfFollowing(userId))
      ]);

      setStats({
        followers: followersResult.success ? followersResult.count : 0,
        following: followingResult.success ? followingResult.count : 0,
        isFollowing: statusResult.success ? statusResult.isFollowing : false
      });

    } catch (error) {
      console.error('Erreur lors du chargement des stats:', error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return {
    stats,
    loading,
    refreshStats: loadStats
  };
}