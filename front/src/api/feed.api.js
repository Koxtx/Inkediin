import { BASE_URL } from "../utils/url";

// Configuration des headers par défaut
const getHeaders = (includeAuth = true) => {
  const headers = {
    'Content-Type': 'application/json',
  };
  
  if (includeAuth) {
    const token = localStorage.getItem('token');
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }
  
  return headers;
};

// Configuration des headers pour FormData (multipart)
const getFormDataHeaders = () => {
  const headers = {};
  const token = localStorage.getItem('token');
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
};

// Gestion des erreurs
const handleApiError = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || errorData.error || 'Erreur API');
  }
  return response.json();
};

// API des feeds
export const feedApi = {
  // Récupérer tous les feeds avec pagination et filtres
  getFeeds: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      
      // Paramètres de pagination
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      
      // Paramètres de tri
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.order) queryParams.append('order', params.order);
      
      // Filtre par tatoueur
      if (params.tatoueurId) queryParams.append('tatoueurId', params.tatoueurId);
      
      const url = `${BASE_URL}/api/feeds${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: getHeaders(false), // Les feeds publics ne nécessitent pas d'auth
      });
      
      return await handleApiError(response);
    } catch (error) {
      console.error('Erreur lors de la récupération des feeds:', error);
      throw error;
    }
  },

  // Récupérer un feed par ID
  getFeedById: async (feedId) => {
    try {
      const response = await fetch(`${BASE_URL}/api/feeds/${feedId}`, {
        method: 'GET',
        headers: getHeaders(false), // Feed public
      });
      
      return await handleApiError(response);
    } catch (error) {
      console.error('Erreur lors de la récupération du feed:', error);
      throw error;
    }
  },

  // Créer un nouveau feed
  createFeed: async (feedData) => {
    try {
      const formData = new FormData();
      
      // Ajouter le contenu
      if (feedData.contenu) {
        formData.append('contenu', feedData.contenu);
      }
      
      // Ajouter l'image si présente
      if (feedData.image) {
        formData.append('image', feedData.image);
      }
      
      const response = await fetch(`${BASE_URL}/api/feeds`, {
        method: 'POST',
        headers: getFormDataHeaders(),
        body: formData,
      });
      
      return await handleApiError(response);
    } catch (error) {
      console.error('Erreur lors de la création du feed:', error);
      throw error;
    }
  },

  // Mettre à jour un feed
  updateFeed: async (feedId, feedData) => {
    try {
      const response = await fetch(`${BASE_URL}/api/feeds/${feedId}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(feedData),
      });
      
      return await handleApiError(response);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du feed:', error);
      throw error;
    }
  },

  // Supprimer un feed
  deleteFeed: async (feedId) => {
    try {
      const response = await fetch(`${BASE_URL}/api/feeds/${feedId}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      
      return await handleApiError(response);
    } catch (error) {
      console.error('Erreur lors de la suppression du feed:', error);
      throw error;
    }
  },

  // Liker/Unliker un feed
  toggleLikeFeed: async (feedId) => {
    try {
      const response = await fetch(`${BASE_URL}/api/feeds/${feedId}/like`, {
        method: 'POST',
        headers: getHeaders(),
      });
      
      return await handleApiError(response);
    } catch (error) {
      console.error('Erreur lors du like/unlike du feed:', error);
      throw error;
    }
  },

  // Ajouter un commentaire
  addComment: async (feedId, commentData) => {
    try {
      const response = await fetch(`${BASE_URL}/api/feeds/${feedId}/comments`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(commentData),
      });
      
      return await handleApiError(response);
    } catch (error) {
      console.error('Erreur lors de l\'ajout du commentaire:', error);
      throw error;
    }
  },

  // Supprimer un commentaire
  deleteComment: async (feedId, commentId) => {
    try {
      const response = await fetch(`${BASE_URL}/api/feeds/${feedId}/comments/${commentId}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      
      return await handleApiError(response);
    } catch (error) {
      console.error('Erreur lors de la suppression du commentaire:', error);
      throw error;
    }
  },
};

// Fonctions utilitaires pour les feeds
export const feedUtils = {
  // Vérifier si un utilisateur a liké un feed
  hasUserLiked: (feed, userId) => {
    return feed.likes?.some(like => like.userId._id === userId || like.userId === userId);
  },

  // Compter le nombre de likes
  getLikesCount: (feed) => {
    return feed.likes?.length || 0;
  },

  // Compter le nombre de commentaires
  getCommentsCount: (feed) => {
    return feed.commentaires?.length || 0;
  },

  // Formater la date de publication
  formatDate: (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      return 'Hier';
    } else if (diffDays < 7) {
      return `Il y a ${diffDays} jours`;
    } else {
      return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    }
  },

  // Valider les données d'un feed avant création
  validateFeedData: (feedData) => {
    const errors = [];
    
    if (!feedData.contenu || feedData.contenu.trim().length === 0) {
      errors.push('Le contenu est requis');
    }
    
    if (feedData.contenu && feedData.contenu.length > 500) {
      errors.push('Le contenu ne peut pas dépasser 500 caractères');
    }
    
    return errors;
  },

  // Valider les données d'un commentaire
  validateCommentData: (commentData) => {
    const errors = [];
    
    if (!commentData.contenu || commentData.contenu.trim().length === 0) {
      errors.push('Le contenu du commentaire est requis');
    }
    
    if (commentData.contenu && commentData.contenu.length > 200) {
      errors.push('Le commentaire ne peut pas dépasser 200 caractères');
    }
    
    return errors;
  },
};

export default feedApi;