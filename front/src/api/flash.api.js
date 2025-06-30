import { BASE_URL } from "../utils/url";

// Configuration des headers par défaut
const getHeaders = (includeAuth = true) => {
  const headers = {
    'Content-Type': 'application/json',
  };
  
 
  
  return headers;
};

// Configuration des headers pour FormData (multipart)
const getFormDataHeaders = () => {
  const headers = {};

  return headers;
};

// Gestion des erreurs
const handleApiError = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.message || 'Erreur API');
  }
  return response.json();
};

// API des flashs
export const flashApi = {
  // Récupérer tous les flashs avec filtres et pagination
  getFlashs: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      
      // Paramètres de filtrage
      if (params.disponible !== undefined) queryParams.append('disponible', params.disponible);
      if (params.tatoueur) queryParams.append('tatoueur', params.tatoueur);
      if (params.prixMin) queryParams.append('prixMin', params.prixMin);
      if (params.prixMax) queryParams.append('prixMax', params.prixMax);
      if (params.style) queryParams.append('style', params.style);
      if (params.taille) queryParams.append('taille', params.taille);
      if (params.tags) queryParams.append('tags', params.tags);
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.order) queryParams.append('order', params.order);
      
      // Paramètres de pagination
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      
      const url = `${BASE_URL}/flashs${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: getHeaders(false), 
        credentials: 'include', 
      });
      
      return await handleApiError(response);
    } catch (error) {
      console.error('Erreur lors de la récupération des flashs:', error);
      throw error;
    }
  },

  // Récupérer un flash par ID
  getFlashById: async (flashId) => {
    try {
      const response = await fetch(`${BASE_URL}/flashs/${flashId}`, {
        method: 'GET',
        headers: getHeaders(false), 
        credentials: 'include', 
      });
      
      return await handleApiError(response);
    } catch (error) {
      console.error('Erreur lors de la récupération du flash:', error);
      throw error;
    }
  },

  // Récupérer les flashs d'un tatoueur
  getFlashsByTatoueur: async (tatoueurId, params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      
      // Paramètres de filtrage
      if (params.disponible !== undefined) queryParams.append('disponible', params.disponible);
      
      // Paramètres de pagination
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      
      const url = `${BASE_URL}/flashs/tatoueur/${tatoueurId}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: getHeaders(false), 
        credentials: 'include', s
      });
      
      return await handleApiError(response);
    } catch (error) {
      console.error('Erreur lors de la récupération des flashs du tatoueur:', error);
      throw error;
    }
  },

  // Créer un nouveau flash
   createFlash: async (flashData) => {
    try {
      const formData = new FormData();
      
      // Ajouter les données obligatoires
      if (flashData.prix) {
        formData.append('prix', flashData.prix);
      }
      
      if (flashData.description) {
        formData.append('description', flashData.description);
      }

      // Nouvelles données selon le contrôleur
      if (flashData.title) {
        formData.append('title', flashData.title);
      }

      if (flashData.artist) {
        formData.append('artist', flashData.artist);
      }

      if (flashData.style) {
        formData.append('style', flashData.style);
      }

      
      if (flashData.styleCustom) {
        formData.append('styleCustom', flashData.styleCustom);
        
      } else {
        console.log("📤 API - Pas de styleCustom dans flashData:", flashData.styleCustom);
      }

      if (flashData.taille) {
        formData.append('taille', flashData.taille);
      }

      if (flashData.emplacement) {
        // Si c'est un array, le stringifier
        const emplacementValue = Array.isArray(flashData.emplacement) 
          ? JSON.stringify(flashData.emplacement) 
          : flashData.emplacement;
        formData.append('emplacement', emplacementValue);
      }

      if (flashData.tags) {
        // Si c'est un array, le stringifier
        const tagsValue = Array.isArray(flashData.tags) 
          ? JSON.stringify(flashData.tags) 
          : flashData.tags;
        formData.append('tags', tagsValue);
      }
      
      // Ajouter l'image (obligatoire)
      if (flashData.image) {
        formData.append('image', flashData.image);
      }

     
     
      
      const response = await fetch(`${BASE_URL}/flashs`, {
        method: 'POST',
        headers: getFormDataHeaders(),
        body: formData,
        credentials: 'include', // Important pour inclure les cookies
      });
      
      return await handleApiError(response);
    } catch (error) {
      console.error('Erreur lors de la création du flash:', error);
      throw error;
    }
  },

  // Mettre à jour un flash
  updateFlash: async (flashId, flashData) => {
    try {
      
      if (flashData.image && flashData.image instanceof File) {
        const formData = new FormData();
        
       
        Object.keys(flashData).forEach(key => {
          if (key === 'emplacement' || key === 'tags') {
            const value = Array.isArray(flashData[key]) 
              ? JSON.stringify(flashData[key]) 
              : flashData[key];
            formData.append(key, value);
          } else {
            formData.append(key, flashData[key]);
          }
        });

        const response = await fetch(`${BASE_URL}/flashs/${flashId}`, {
          method: 'PUT',
          headers: getFormDataHeaders(),
          body: formData,
          credentials: 'include',
        });
        
        return await handleApiError(response);
      } else {
       
        const response = await fetch(`${BASE_URL}/flashs/${flashId}`, {
          method: 'PUT',
          headers: getHeaders(),
          body: JSON.stringify(flashData),
          credentials: 'include',
        });
        
        return await handleApiError(response);
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du flash:', error);
      throw error;
    }
  },

  // Supprimer un flash
  deleteFlash: async (flashId) => {
    try {
      const response = await fetch(`${BASE_URL}/flashs/${flashId}`, {
        method: 'DELETE',
        headers: getHeaders(),
        credentials: 'include', 
      });
      
      return await handleApiError(response);
    } catch (error) {
      console.error('Erreur lors de la suppression du flash:', error);
      throw error;
    }
  },

  // Basculer le statut de réservation
  toggleReserve: async (flashId) => {
    try {
      const response = await fetch(`${BASE_URL}/flashs/${flashId}/reserve`, {
        method: 'PATCH',
        headers: getHeaders(),
        credentials: 'include', 
      });
      
      return await handleApiError(response);
    } catch (error) {
      console.error('Erreur lors du changement de statut de réservation:', error);
      throw error;
    }
  },

 

  // Liker/Unliker un flash
  likeFlash: async (flashId) => {
    try {
      const response = await fetch(`${BASE_URL}/flashs/${flashId}/like`, {
        method: 'POST',
        headers: getHeaders(),
        credentials: 'include', 
      });
      
      return await handleApiError(response);
    } catch (error) {
      console.error('Erreur lors du like du flash:', error);
      throw error;
    }
  },

  // Réserver un flash
  reserveFlash: async (flashId) => {
    try {
      const response = await fetch(`${BASE_URL}/flashs/${flashId}/reserve`, {
        method: 'POST',
        headers: getHeaders(),
        credentials: 'include', 
      });
      
      return await handleApiError(response);
    } catch (error) {
      console.error('Erreur lors de la réservation du flash:', error);
      throw error;
    }
  },

  // Sauvegarder/Unsauvegarder un flash
  saveFlash: async (flashId) => {
    try {
      const response = await fetch(`${BASE_URL}/flashs/${flashId}/save`, {
        method: 'POST',
        headers: getHeaders(),
        credentials: 'include',
      });
      
      return await handleApiError(response);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du flash:', error);
      throw error;
    }
  },

  // Supprimer un flash des favoris
  unsaveFlash: async (flashId) => {
    try {
      const response = await fetch(`${BASE_URL}/flashs/${flashId}/save`, {
        method: 'DELETE',
        headers: getHeaders(),
        credentials: 'include', 
      });
      
      return await handleApiError(response);
    } catch (error) {
      console.error('Erreur lors de la suppression du flash des favoris:', error);
      throw error;
    }
  },

  // Récupérer les flashs sauvegardés
  getSavedFlashs: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      
      const url = `${BASE_URL}/flashs/saved${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: getHeaders(),
        credentials: 'include', 
      });
      
      return await handleApiError(response);
    } catch (error) {
      console.error('Erreur lors de la récupération des flashs sauvegardés:', error);
      throw error;
    }
  },

  

  // Ajouter un commentaire
  addComment: async (flashId, contenu) => {
    try {
      const response = await fetch(`${BASE_URL}/flashs/${flashId}/comments`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ contenu }),
        credentials: 'include', 
      });
      
      return await handleApiError(response);
    } catch (error) {
      console.error('Erreur lors de l\'ajout du commentaire:', error);
      throw error;
    }
  },

  // Supprimer un commentaire
  deleteComment: async (flashId, commentId) => {
    try {
      const response = await fetch(`${BASE_URL}/flashs/${flashId}/comments/${commentId}`, {
        method: 'DELETE',
        headers: getHeaders(),
        credentials: 'include',
      });
      
      return await handleApiError(response);
    } catch (error) {
      console.error('Erreur lors de la suppression du commentaire:', error);
      throw error;
    }
  },

  // Liker un commentaire
  likeComment: async (flashId, commentId) => {
    try {
      const response = await fetch(`${BASE_URL}/flashs/${flashId}/comments/${commentId}/like`, {
        method: 'POST',
        headers: getHeaders(),
        credentials: 'include',
      });
      
      return await handleApiError(response);
    } catch (error) {
      console.error('Erreur lors du like du commentaire:', error);
      throw error;
    }
  },

  // Ajouter une réponse à un commentaire
  addReplyToComment: async (flashId, commentId, contenu) => {
    try {
      const response = await fetch(`${BASE_URL}/flashs/${flashId}/comments/${commentId}/replies`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ contenu }),
        credentials: 'include',
      });
      
      return await handleApiError(response);
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la réponse:', error);
      throw error;
    }
  },

  // Liker une réponse
  likeReply: async (flashId, commentId, replyId) => {
    try {
      const response = await fetch(`${BASE_URL}/flashs/${flashId}/comments/${commentId}/replies/${replyId}/like`, {
        method: 'POST',
        headers: getHeaders(),
        credentials: 'include', 
      });
      
      return await handleApiError(response);
    } catch (error) {
      console.error('Erreur lors du like de la réponse:', error);
      throw error;
    }
  },

  // Supprimer une réponse
  deleteReply: async (flashId, commentId, replyId) => {
    try {
      const response = await fetch(`${BASE_URL}/flashs/${flashId}/comments/${commentId}/replies/${replyId}`, {
        method: 'DELETE',
        headers: getHeaders(),
        credentials: 'include', 
      });
      
      return await handleApiError(response);
    } catch (error) {
      console.error('Erreur lors de la suppression de la réponse:', error);
      throw error;
    }
  },
};

// Fonctions utilitaires pour les flashs (nettoyées sans rating)
export const flashUtils = {
  // Vérifier si un flash est disponible
  isAvailable: (flash) => {
    return flash.disponible && !flash.reserve;
  },

  // Vérifier si un flash est réservé
  isReserved: (flash) => {
    return flash.reserve;
  },

  // Formater le prix
  formatPrice: (price) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  },

  // Formater la date
  formatDate: (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Aujourd\'hui';
    } else if (diffDays === 1) {
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

  // Obtenir le statut du flash
  getStatus: (flash) => {
    if (!flash.disponible) return 'Indisponible';
    if (flash.reserve) return 'Réservé';
    return 'Disponible';
  },

  // Obtenir la couleur du badge de statut
  getStatusColor: (flash) => {
    if (!flash.disponible) return 'gray';
    if (flash.reserve) return 'orange';
    return 'green';
  },

  // Valider les données d'un flash avant création
  validateFlashData: (flashData) => {
    const errors = [];
    
    if (!flashData.image) {
      errors.push('Une image est requise');
    }
    
    if (!flashData.prix || isNaN(flashData.prix) || flashData.prix < 0) {
      errors.push('Un prix valide est requis');
    }
    
    if (flashData.prix && flashData.prix > 10000) {
      errors.push('Le prix ne peut pas dépasser 10 000€');
    }
    
    if (flashData.description && flashData.description.length > 500) {
      errors.push('La description ne peut pas dépasser 500 caractères');
    }
    
    // Validation pour les nouveaux champs
    if (flashData.title && flashData.title.length > 100) {
      errors.push('Le titre ne peut pas dépasser 100 caractères');
    }
    
    if (flashData.artist && flashData.artist.length > 100) {
      errors.push('Le nom de l\'artiste ne peut pas dépasser 100 caractères');
    }
    
    return errors;
  },

  // Filtrer les flashs par critères (mis à jour avec nouveaux filtres)
  filterFlashs: (flashs, filters) => {
    return flashs.filter(flash => {
      // Filtre par disponibilité
      if (filters.disponible !== undefined && flash.disponible !== filters.disponible) {
        return false;
      }
      
      // Filtre par prix minimum
      if (filters.prixMin && flash.prix < filters.prixMin) {
        return false;
      }
      
      // Filtre par prix maximum
      if (filters.prixMax && flash.prix > filters.prixMax) {
        return false;
      }
      
      // Filtre par tatoueur
      if (filters.tatoueur && flash.idTatoueur._id !== filters.tatoueur) {
        return false;
      }

      // Filtre par style
      if (filters.style && flash.style !== filters.style) {
        return false;
      }

      // Filtre par taille
      if (filters.taille && flash.taille !== filters.taille) {
        return false;
      }

      // Filtre par tags
      if (filters.tags && filters.tags.length > 0) {
        const flashTags = flash.tags || [];
        const hasMatchingTag = filters.tags.some(tag => 
          flashTags.some(flashTag => 
            flashTag.toLowerCase().includes(tag.toLowerCase())
          )
        );
        if (!hasMatchingTag) {
          return false;
        }
      }
      
      return true;
    });
  },

  // Trier les flashs (nettoyé sans rating)
  sortFlashs: (flashs, sortBy = 'date', order = 'desc') => {
    return flashs.sort((a, b) => {
      let valueA, valueB;
      
      switch (sortBy) {
        case 'prix':
          valueA = a.prix;
          valueB = b.prix;
          break;
        case 'views':
          valueA = a.views || 0;
          valueB = b.views || 0;
          break;
        case 'likes':
          valueA = a.likesCount || a.likes?.length || 0;
          valueB = b.likesCount || b.likes?.length || 0;
          break;
        case 'date':
        default:
          valueA = new Date(a.date || a.createdAt);
          valueB = new Date(b.date || b.createdAt);
          break;
      }
      
      if (order === 'asc') {
        return valueA > valueB ? 1 : -1;
      } else {
        return valueA < valueB ? 1 : -1;
      }
    });
  },

  // Calculer les statistiques des flashs (nettoyé sans rating)
  getStats: (flashs) => {
    const total = flashs.length;
    const disponibles = flashs.filter(f => f.disponible && !f.reserve).length;
    const reserves = flashs.filter(f => f.reserve).length;
    const indisponibles = flashs.filter(f => !f.disponible).length;
    
    const prix = flashs.map(f => f.prix);
    const prixMoyen = prix.length > 0 ? prix.reduce((a, b) => a + b, 0) / prix.length : 0;
    const prixMin = prix.length > 0 ? Math.min(...prix) : 0;
    const prixMax = prix.length > 0 ? Math.max(...prix) : 0;
    
    // Stats d'engagement (sans rating)
    const totalLikes = flashs.reduce((acc, f) => acc + (f.likesCount || f.likes?.length || 0), 0);
    const totalViews = flashs.reduce((acc, f) => acc + (f.views || 0), 0);
    
    return {
      total,
      disponibles,
      reserves,
      indisponibles,
      prix: {
        moyen: prixMoyen,
        min: prixMin,
        max: prixMax
      },
      engagement: {
        totalLikes,
        totalViews
      }
    };
  },

  // Vérifier si l'utilisateur a liké un flash
  hasUserLiked: (flash, userId) => {
    if (!flash.likes || !userId) return false;
    return flash.likes.some(like => like.userId._id === userId || like.userId === userId);
  },

  // Vérifier si l'utilisateur a sauvegardé un flash
  hasUserSaved: (savedFlashs, flashId) => {
    if (!savedFlashs || !flashId) return false;
    return savedFlashs.some(saved => 
      (saved._id || saved) === flashId
    );
  },
};

export default flashApi;