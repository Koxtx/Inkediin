import { useState, useEffect, useCallback } from 'react';
import { publicationApi } from '../api/feed.api';

/**
 * Hook personnalisé pour gérer les publications d'un utilisateur spécifique
 * @param {string} userId - ID de l'utilisateur
 * @param {boolean} isOwnProfile - Si c'est le profil de l'utilisateur connecté
 * @returns {Object} Objet contenant les données et fonctions de gestion
 */
export const useUserPublications = (userId, isOwnProfile = false) => {
  const [publications, setPublications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  // Charger les publications
  const loadPublications = useCallback(async (page = 1, append = false) => {
    if (!userId) return;

    try {
      setLoading(true);
      setError(null);

      let response;
      if (isOwnProfile) {
        // Pour son propre profil, récupérer toutes ses publications
        response = await publicationApi.getPublications({
          page,
          limit: 12,
          sortBy: 'datePublication',
          order: 'desc',
          tatoueurId: userId
        });
      } else {
        // Pour les autres profils, récupérer les publications publiques de cet artiste
        response = await publicationApi.getPublicationsByTattooArtist(userId, {
          page,
          limit: 12
        });
      }

      if (response.publications) {
        const adaptedPublications = response.publications.map(pub => ({
          id: pub._id || pub.id,
          imageUrl: pub.image || null,
          title: pub.contenu?.slice(0, 50) + (pub.contenu?.length > 50 ? '...' : '') || 'Sans titre',
          style: pub.tags?.[0] || 'Style non défini',
          contenu: pub.contenu,
          tags: pub.tags || [],
          likes: pub.likes?.length || 0,
          comments: pub.commentaires?.length || 0,
          datePublication: pub.datePublication || pub.createdAt,
          isLiked: pub.likes?.some(like => like.userId === userId) || false,
          isSaved: false, // À implémenter selon votre logique
          username: pub.idTatoueur?.nom || 'Utilisateur',
          artistId: pub.idTatoueur?._id || userId
        }));

        if (append) {
          setPublications(prev => [...prev, ...adaptedPublications]);
        } else {
          setPublications(adaptedPublications);
        }

        setTotalCount(response.total || adaptedPublications.length);
        setHasMore(adaptedPublications.length === 12);
        setCurrentPage(page);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des publications:', error);
      setError('Erreur lors du chargement des publications');
    } finally {
      setLoading(false);
    }
  }, [userId, isOwnProfile]);

  // Charger plus de publications
  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      loadPublications(currentPage + 1, true);
    }
  }, [loadPublications, currentPage, loading, hasMore]);

  // Rafraîchir les publications
  const refresh = useCallback(() => {
    setCurrentPage(1);
    loadPublications(1, false);
  }, [loadPublications]);

  // Liker une publication
  const likePublication = useCallback(async (publicationId) => {
    try {
      // Mise à jour optimiste
      setPublications(prev => prev.map(pub => 
        pub.id === publicationId 
          ? {
              ...pub,
              isLiked: !pub.isLiked,
              likes: pub.isLiked ? pub.likes - 1 : pub.likes + 1
            }
          : pub
      ));

      await publicationApi.toggleLikePublication(publicationId);
    } catch (error) {
      console.error('Erreur lors du like:', error);
      // Rollback en cas d'erreur
      setPublications(prev => prev.map(pub => 
        pub.id === publicationId 
          ? {
              ...pub,
              isLiked: !pub.isLiked,
              likes: pub.isLiked ? pub.likes + 1 : pub.likes - 1
            }
          : pub
      ));
      throw error;
    }
  }, []);

  // Supprimer une publication
  const deletePublication = useCallback(async (publicationId) => {
    try {
      await publicationApi.deletePublication(publicationId);
      setPublications(prev => prev.filter(pub => pub.id !== publicationId));
      setTotalCount(prev => prev - 1);
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      throw error;
    }
  }, []);

  // Ajouter une nouvelle publication (pour le profil personnel)
  const addPublication = useCallback((newPublication) => {
    const adaptedPublication = {
      id: newPublication._id || newPublication.id,
      imageUrl: newPublication.image || null,
      title: newPublication.contenu?.slice(0, 50) + (newPublication.contenu?.length > 50 ? '...' : '') || 'Sans titre',
      style: newPublication.tags?.[0] || 'Style non défini',
      contenu: newPublication.contenu,
      tags: newPublication.tags || [],
      likes: 0,
      comments: 0,
      datePublication: new Date().toISOString(),
      isLiked: false,
      isSaved: false,
      username: newPublication.username || 'Votre nom',
      artistId: userId
    };

    setPublications(prev => [adaptedPublication, ...prev]);
    setTotalCount(prev => prev + 1);
  }, [userId]);

  // Charger les publications au montage et quand userId change
  useEffect(() => {
    if (userId) {
      loadPublications();
    }
  }, [userId, loadPublications]);

  return {
    // État
    publications,
    loading,
    error,
    hasMore,
    totalCount,
    currentPage,
    
    // Actions
    loadMore,
    refresh,
    likePublication,
    deletePublication,
    addPublication,
    
    // Utilitaires
    isEmpty: publications.length === 0,
    isLoadingInitial: loading && publications.length === 0,
    isLoadingMore: loading && publications.length > 0
  };
};

export default useUserPublications;