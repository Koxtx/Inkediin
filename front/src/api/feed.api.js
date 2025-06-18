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

      const url = `${BASE_URL}/feed${
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

      const url = `${BASE_URL}/feed/followed${
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

      const url = `${BASE_URL}/feed/recommended${
        queryParams.toString() ? `?${queryParams.toString()}` : ""
      }`;

      const response = await fetch(url, getFetchConfig("GET"));

      return await handleApiError(response);
    } catch (error) {
      throw error;
    }
  },

  // Récupérer une publication par ID
  getPublicationById: async (publicationId) => {
    try {
      const response = await fetch(
        `${BASE_URL}/feed/${publicationId}`,
        getFetchConfig("GET")
      );

      return await handleApiError(response);
    } catch (error) {
      throw error;
    }
  },

  // Créer une nouvelle publication
  createPublication: async (publicationData) => {
    try {
      const formData = new FormData();

      // Ajouter le contenu
      if (publicationData.contenu) {
        formData.append("contenu", publicationData.contenu);
      }

      // Ajouter l'image si présente
      if (publicationData.image) {
        formData.append("image", publicationData.image);
      }

      // Ajouter les tags si présents
      if (publicationData.tags && Array.isArray(publicationData.tags)) {
        publicationData.tags.forEach((tag) => {
          formData.append("tags[]", tag);
        });
      }

      const response = await fetch(
        `${BASE_URL}/feed`,
        getFetchConfig("POST", formData, true)
      );

      return await handleApiError(response);
    } catch (error) {
      throw error;
    }
  },

  // Mettre à jour une publication
  updatePublication: async (publicationId, publicationData) => {
    try {
      const response = await fetch(
        `${BASE_URL}/feed/${publicationId}`,
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
        `${BASE_URL}/feed/${publicationId}`,
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
        `${BASE_URL}/feed/${publicationId}/like`,
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
        `${BASE_URL}/feed/${publicationId}/save`,
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

      const url = `${BASE_URL}/feed/saved${
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
        `${BASE_URL}/feed/${publicationId}/comments`,
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
        `${BASE_URL}/feed/${publicationId}/comments/${commentId}`,
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
        `${BASE_URL}/feed/${publicationId}/comments/${commentId}/like`,
        getFetchConfig("POST")
      );

      return await handleApiError(response);
    } catch (error) {
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

      const url = `${BASE_URL}/feed/search?${queryParams.toString()}`;

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

      const url = `${BASE_URL}/feed/artist/${artistId}${
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

  // Compter le nombre de likes
  getLikesCount: (publication) => {
    return publication.likes?.length || 0;
  },

  // Compter le nombre de commentaires
  getCommentsCount: (publication) => {
    return publication.commentaires?.length || 0;
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
      `${BASE_URL}/feed?limit=1`,
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