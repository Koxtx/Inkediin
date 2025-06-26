import { BASE_URL } from "../utils/url";

// Configuration des headers par défaut pour l'authentification par cookies
const getHeaders = (includeContentType = true) => {
  const headers = {};

  if (includeContentType) {
    headers["Content-Type"] = "application/json";
  }

  return headers;
};

// Configuration pour les requêtes avec cookies
const getFetchConfig = (method = "GET", body = null, isFormData = false) => {
  const config = {
    method,
    credentials: "include", // IMPORTANT: Inclut automatiquement les cookies
    headers: getHeaders(!isFormData), // Pas de Content-Type pour FormData
  };

  if (body) {
    config.body = isFormData ? body : JSON.stringify(body);
  }

  return config;
};

// Gestion des erreurs
const handleApiError = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));

    // Si erreur 401, rediriger vers la page de connexion
    if (response.status === 401) {
      // Optionnel: redirection automatique
      // window.location.href = '/login';
    }

    throw new Error(
      errorData.message || errorData.error || `Erreur ${response.status}`
    );
  }
  return response.json();
};

// API des publications (feeds)
export const publicationApi = {
  // Récupérer toutes les publications avec pagination et filtres
  getPublications: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();

      // Paramètres de pagination
      if (params.page) queryParams.append("page", params.page);
      if (params.limit) queryParams.append("limit", params.limit);

      // Paramètres de tri
      if (params.sortBy) queryParams.append("sortBy", params.sortBy);
      if (params.order) queryParams.append("order", params.order);

      // Filtre par tatoueur
      if (params.tatoueurId)
        queryParams.append("tatoueurId", params.tatoueurId);

      const url = `${BASE_URL}/feeds${
        queryParams.toString() ? `?${queryParams.toString()}` : ""
      }`;

      const response = await fetch(url, getFetchConfig("GET"));

      return await handleApiError(response);
    } catch (error) {
      throw error;
    }
  },

  // Récupérer les publications des tatoueurs suivis
  getFollowedPublications: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append("page", params.page);
      if (params.limit) queryParams.append("limit", params.limit);

      const url = `${BASE_URL}/feeds/followed${
        queryParams.toString() ? `?${queryParams.toString()}` : ""
      }`;

      const response = await fetch(url, getFetchConfig("GET"));

      return await handleApiError(response);
    } catch (error) {
      throw error;
    }
  },

  // Récupérer les publications recommandées
  getRecommendedPublications: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append("page", params.page);
      if (params.limit) queryParams.append("limit", params.limit);

      const url = `${BASE_URL}/feeds/recommended${
        queryParams.toString() ? `?${queryParams.toString()}` : ""
      }`;

      const response = await fetch(url, getFetchConfig("GET"));

      return await handleApiError(response);
    } catch (error) {
      throw error;
    }
  },

  // Récupérer une publication par ID
 // Récupérer une publication par ID
  getPublicationById: async (publicationId) => {
    try {
      console.log("🔍 API - getPublicationById:", publicationId);
      
      const response = await fetch(
        `${BASE_URL}/feeds/${publicationId}`,
        getFetchConfig("GET")
      );

      console.log("📡 API Response status:", response.status);
      
      if (!response.ok) {
        // ✅ AMÉLIORATION: Gestion spécifique des erreurs 404
        if (response.status === 404) {
          throw new Error("Publication non trouvée");
        }
        
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Erreur ${response.status}`);
      }

      const result = await response.json();
      console.log("✅ API - Publication récupérée:", result);
      
      return result;
    } catch (error) {
      console.error("❌ API - Erreur getPublicationById:", error);
      throw error;
    }
  },

  // Créer une nouvelle publication
  createPublication: async (publicationData) => {
    try {
      const formData = new FormData();

      // ✅ CORRECTION: Validation côté client
      if (!publicationData.contenu || publicationData.contenu.trim().length === 0) {
        throw new Error("Le contenu est requis");
      }

      // Ajouter le contenu (toujours requis)
      formData.append("contenu", publicationData.contenu.trim());

      // ✅ CORRECTION: Ajouter l'image si présente avec vérification
      if (publicationData.image && publicationData.image instanceof File) {
        console.log('📷 API - Ajout image:', {
          name: publicationData.image.name,
          size: publicationData.image.size,
          type: publicationData.image.type
        });
        formData.append("image", publicationData.image);
      }

      // ✅ CORRECTION: Ajouter les tags avec une meilleure gestion
      if (publicationData.tags && Array.isArray(publicationData.tags) && publicationData.tags.length > 0) {
        // Nettoyer et valider les tags
        const cleanTags = publicationData.tags
          .map(tag => tag.toString().trim())
          .filter(tag => tag.length > 0)
          .map(tag => tag.replace(/^#+/, '')); // Supprimer les # en début
        
        console.log('🏷️ API - Tags à envoyer:', cleanTags);
        
        // Les envoyer comme JSON string pour éviter les problèmes de parsing
        formData.append("tags", JSON.stringify(cleanTags));
      }

      // ✅ AJOUT: Debug du FormData
      console.log('📤 API - FormData contents:');
      for (let [key, value] of formData.entries()) {
        if (value instanceof File) {
          console.log(`${key}: File(${value.name}, ${value.size} bytes, ${value.type})`);
        } else {
          console.log(`${key}: ${value}`);
        }
      }

      const response = await fetch(
        `${BASE_URL}/feeds`,
        getFetchConfig("POST", formData, true)
      );

      const result = await handleApiError(response);
      console.log('✅ API - Publication créée:', result);
      
      return result;
    } catch (error) {
      console.error('❌ API - Erreur création publication:', error);
      throw error;
    }
  },

  // Mettre à jour une publication
  updatePublication: async (publicationId, publicationData) => {
    try {
      const response = await fetch(
        `${BASE_URL}/feeds/${publicationId}`,
        getFetchConfig("PUT", publicationData)
      );

      return await handleApiError(response);
    } catch (error) {
      throw error;
    }
  },

  // Supprimer une publication
  deletePublication: async (publicationId) => {
    try {
      const response = await fetch(
        `${BASE_URL}/feeds/${publicationId}`,
        getFetchConfig("DELETE")
      );

      return await handleApiError(response);
    } catch (error) {
      throw error;
    }
  },

  // Liker/Unliker une publication
  toggleLikePublication: async (publicationId) => {
    try {
      const response = await fetch(
        `${BASE_URL}/feeds/${publicationId}/like`,
        getFetchConfig("POST")
      );

      return await handleApiError(response);
    } catch (error) {
      throw error;
    }
  },

  // Sauvegarder/Désauvegarder une publication
  toggleSavePublication: async (publicationId) => {
    try {
      const response = await fetch(
        `${BASE_URL}/feeds/${publicationId}/save`,
        getFetchConfig("POST")
      );

      return await handleApiError(response);
    } catch (error) {
      throw error;
    }
  },

  // Récupérer les publications sauvegardées
  getSavedPublications: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append("page", params.page);
      if (params.limit) queryParams.append("limit", params.limit);

      const url = `${BASE_URL}/feeds/saved${
        queryParams.toString() ? `?${queryParams.toString()}` : ""
      }`;

      const response = await fetch(url, getFetchConfig("GET"));

      return await handleApiError(response);
    } catch (error) {
      throw error;
    }
  },

  // Ajouter un commentaire
  addComment: async (publicationId, commentData) => {
    try {
      const response = await fetch(
        `${BASE_URL}/feeds/${publicationId}/comments`,
        getFetchConfig("POST", commentData)
      );

      return await handleApiError(response);
    } catch (error) {
      throw error;
    }
  },

  // Supprimer un commentaire
  deleteComment: async (publicationId, commentId) => {
    try {
      const response = await fetch(
        `${BASE_URL}/feeds/${publicationId}/comments/${commentId}`,
        getFetchConfig("DELETE")
      );

      return await handleApiError(response);
    } catch (error) {
      throw error;
    }
  },

  // Liker un commentaire
  toggleLikeComment: async (publicationId, commentId) => {
    try {
      const response = await fetch(
        `${BASE_URL}/feeds/${publicationId}/comments/${commentId}/like`,
        getFetchConfig("POST")
      );
      return await handleApiError(response);
    } catch (error) {
      throw error;
    }
  },

  // ✅ AJOUT: Ajouter une réponse à un commentaire
  addReplyToComment: async (publicationId, commentId, replyData) => {
    try {
      console.log('💬 API - Ajout réponse:', { publicationId, commentId, replyData });
      
      const response = await fetch(
        `${BASE_URL}/feeds/${publicationId}/comments/${commentId}/replies`,
        getFetchConfig("POST", replyData)
      );
      
      const result = await handleApiError(response);
      console.log('✅ API - Réponse ajoutée:', result);
      
      return result;
    } catch (error) {
      console.error('❌ API - Erreur ajout réponse:', error);
      throw error;
    }
  },

  // ✅ AJOUT: Liker une réponse
  toggleLikeReply: async (publicationId, commentId, replyId) => {
    try {
      console.log('👍 API - Toggle like réponse:', { publicationId, commentId, replyId });
      
      const response = await fetch(
        `${BASE_URL}/feeds/${publicationId}/comments/${commentId}/replies/${replyId}/like`,
        getFetchConfig("POST")
      );
      
      const result = await handleApiError(response);
      console.log('✅ API - Like réponse:', result);
      
      return result;
    } catch (error) {
      console.error('❌ API - Erreur like réponse:', error);
      throw error;
    }
  },

  // ✅ AJOUT: Supprimer une réponse
  deleteReply: async (publicationId, commentId, replyId) => {
    try {
      console.log('🗑️ API - Suppression réponse:', { publicationId, commentId, replyId });
      
      const response = await fetch(
        `${BASE_URL}/feeds/${publicationId}/comments/${commentId}/replies/${replyId}`,
        getFetchConfig("DELETE")
      );
      
      const result = await handleApiError(response);
      console.log('✅ API - Réponse supprimée:', result);
      
      return result;
    } catch (error) {
      console.error('❌ API - Erreur suppression réponse:', error);
      throw error;
    }
  },

  // Rechercher des publications par tag
  getPublicationsByTag: async (tag, params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append("tag", tag);
      if (params.page) queryParams.append("page", params.page);
      if (params.limit) queryParams.append("limit", params.limit);

      const url = `${BASE_URL}/feeds/search?${queryParams.toString()}`;

      const response = await fetch(url, getFetchConfig("GET"));

      return await handleApiError(response);
    } catch (error) {
      throw error;
    }
  },

  // Récupérer les publications d'un tatoueur spécifique
  getPublicationsByTattooArtist: async (artistId, params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append("page", params.page);
      if (params.limit) queryParams.append("limit", params.limit);

      const url = `${BASE_URL}/feeds/artist/${artistId}${
        queryParams.toString() ? `?${queryParams.toString()}` : ""
      }`;

      const response = await fetch(url, getFetchConfig("GET"));

      return await handleApiError(response);
    } catch (error) {
      throw error;
    }
  },
};

// Fonctions utilitaires pour les publications
export const publicationUtils = {
  // Vérifier si un utilisateur a liké une publication
  hasUserLiked: (publication, userId) => {
    return publication.likes?.some(
      (like) => (like.userId?._id || like.userId) === userId
    );
  },

  // Vérifier si une publication est sauvegardée
  isPublicationSaved: (publication, userId) => {
    return publication.saves?.some(
      (save) => (save.userId?._id || save.userId) === userId
    );
  },

  // ✅ AJOUT: Vérifier si un utilisateur a liké un commentaire
  hasUserLikedComment: (comment, userId) => {
    return comment.likes?.some(
      (like) => (like.userId?._id || like.userId) === userId
    );
  },

  // ✅ AJOUT: Vérifier si un utilisateur a liké une réponse
  hasUserLikedReply: (reply, userId) => {
    return reply.likes?.some(
      (like) => (like.userId?._id || like.userId) === userId
    );
  },

  // Compter le nombre de likes
  getLikesCount: (publication) => {
    return publication.likes?.length || 0;
  },

  // ✅ AJOUT: Compter le nombre de likes d'un commentaire
  getCommentLikesCount: (comment) => {
    return comment.likes?.length || 0;
  },

  // ✅ AJOUT: Compter le nombre de likes d'une réponse
  getReplyLikesCount: (reply) => {
    return reply.likes?.length || 0;
  },

  // Compter le nombre de commentaires
  getCommentsCount: (publication) => {
    return publication.commentaires?.length || 0;
  },

  // ✅ AJOUT: Compter le nombre de réponses d'un commentaire
  getRepliesCount: (comment) => {
    return comment.reponses?.length || 0;
  },

  // Formater la date de publication
  formatDate: (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffMinutes = Math.floor(diffTime / (1000 * 60));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffMinutes < 60) {
      return diffMinutes === 0 ? "À l'instant" : `Il y a ${diffMinutes} min`;
    } else if (diffHours < 24) {
      return `Il y a ${diffHours}h`;
    } else if (diffDays === 1) {
      return "Hier";
    } else if (diffDays < 7) {
      return `Il y a ${diffDays} jours`;
    } else {
      return date.toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    }
  },

  // Valider les données d'une publication avant création
  validatePublicationData: (publicationData) => {
    const errors = [];

    if (
      !publicationData.contenu ||
      publicationData.contenu.trim().length === 0
    ) {
      errors.push("Le contenu est requis");
    }

    if (publicationData.contenu && publicationData.contenu.length > 1000) {
      errors.push("Le contenu ne peut pas dépasser 1000 caractères");
    }

    // Validation de l'image si présente
    if (publicationData.image) {
      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
      ];
      if (!allowedTypes.includes(publicationData.image.type)) {
        errors.push("Format d'image non supporté (jpg, png, webp uniquement)");
      }

      const maxSize = 5 * 1024 * 1024; // 5MB
      if (publicationData.image.size > maxSize) {
        errors.push("La taille de l'image ne peut pas dépasser 5MB");
      }
    }

    return errors;
  },

  // Valider les données d'un commentaire
  validateCommentData: (commentData) => {
    const errors = [];

    if (!commentData.contenu || commentData.contenu.trim().length === 0) {
      errors.push("Le contenu du commentaire est requis");
    }

    if (commentData.contenu && commentData.contenu.length > 500) {
      errors.push("Le commentaire ne peut pas dépasser 500 caractères");
    }

    return errors;
  },

  // ✅ AJOUT: Valider les données d'une réponse
  validateReplyData: (replyData) => {
    const errors = [];

    if (!replyData.contenu || replyData.contenu.trim().length === 0) {
      errors.push("Le contenu de la réponse est requis");
    }

    if (replyData.contenu && replyData.contenu.length > 300) {
      errors.push("La réponse ne peut pas dépasser 300 caractères");
    }

    return errors;
  },

  // Extraire les hashtags d'un texte
  extractHashtags: (text) => {
    const hashtags = text.match(/#\w+/g);
    return hashtags
      ? hashtags.map((tag) => tag.substring(1).toLowerCase())
      : [];
  },

  // Adapter les données de l'API pour le frontend
  adaptPublicationData: (apiPublication) => {
    return {
      id: apiPublication._id || apiPublication.id,
      idTatoueur: apiPublication.idTatoueur?._id || apiPublication.idTatoueur,
      username:
        apiPublication.idTatoueur?.nom ||
        apiPublication.username ||
        "Utilisateur",
      time: publicationUtils.formatDate(
        apiPublication.datePublication || apiPublication.createdAt
      ),
      datePublication: new Date(
        apiPublication.datePublication || apiPublication.createdAt
      ),
      contenu: apiPublication.contenu,
      image: apiPublication.image,
      tags:
        apiPublication.tags ||
        publicationUtils.extractHashtags(apiPublication.contenu || ""),
      likes: publicationUtils.getLikesCount(apiPublication),
      isLiked: false, // À déterminer côté client avec l'ID utilisateur
      isSaved: false, // À déterminer côté client avec l'ID utilisateur
      comments: publicationUtils.getCommentsCount(apiPublication),
      commentsData: apiPublication.commentaires || [],
    };
  },
};

// Fonction de test de l'API
export const testApiConnection = async () => {
  try {
    const response = await fetch(
      `${BASE_URL}/feeds?limit=1`,
      getFetchConfig("GET")
    );

    if (response.ok) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    return false;
  }
};

export default publicationApi;