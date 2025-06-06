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
      
      // Paramètres de pagination
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      
      const url = `${BASE_URL}/api/flashs${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: getHeaders(false), // Les flashs publics ne nécessitent pas d'auth
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
      const response = await fetch(`${BASE_URL}/api/flashs/${flashId}`, {
        method: 'GET',
        headers: getHeaders(false), // Flash public
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
      
      const url = `${BASE_URL}/api/flashs/tatoueur/${tatoueurId}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: getHeaders(false), // Flash public
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
      
      // Ajouter l'image (obligatoire)
      if (flashData.image) {
        formData.append('image', flashData.image);
      }
      
      const response = await fetch(`${BASE_URL}/api/flashs`, {
        method: 'POST',
        headers: getFormDataHeaders(),
        body: formData,
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
      const response = await fetch(`${BASE_URL}/api/flashs/${flashId}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(flashData),
      });
      
      return await handleApiError(response);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du flash:', error);
      throw error;
    }
  },

  // Supprimer un flash
  deleteFlash: async (flashId) => {
    try {
      const response = await fetch(`${BASE_URL}/api/flashs/${flashId}`, {
        method: 'DELETE',
        headers: getHeaders(),
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
      const response = await fetch(`${BASE_URL}/api/flashs/${flashId}/reserve`, {
        method: 'PATCH',
        headers: getHeaders(),
      });
      
      return await handleApiError(response);
    } catch (error) {
      console.error('Erreur lors du changement de statut de réservation:', error);
      throw error;
    }
  },
};

// Fonctions utilitaires pour les flashs
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
    
    return errors;
  },

  // Filtrer les flashs par critères
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
      
      return true;
    });
  },

  // Trier les flashs
  sortFlashs: (flashs, sortBy = 'date', order = 'desc') => {
    return flashs.sort((a, b) => {
      let valueA, valueB;
      
      switch (sortBy) {
        case 'prix':
          valueA = a.prix;
          valueB = b.prix;
          break;
        case 'date':
        default:
          valueA = new Date(a.date);
          valueB = new Date(b.date);
          break;
      }
      
      if (order === 'asc') {
        return valueA > valueB ? 1 : -1;
      } else {
        return valueA < valueB ? 1 : -1;
      }
    });
  },

  // Calculer les statistiques des flashs
  getStats: (flashs) => {
    const total = flashs.length;
    const disponibles = flashs.filter(f => f.disponible && !f.reserve).length;
    const reserves = flashs.filter(f => f.reserve).length;
    const indisponibles = flashs.filter(f => !f.disponible).length;
    
    const prix = flashs.map(f => f.prix);
    const prixMoyen = prix.length > 0 ? prix.reduce((a, b) => a + b, 0) / prix.length : 0;
    const prixMin = prix.length > 0 ? Math.min(...prix) : 0;
    const prixMax = prix.length > 0 ? Math.max(...prix) : 0;
    
    return {
      total,
      disponibles,
      reserves,
      indisponibles,
      prix: {
        moyen: prixMoyen,
        min: prixMin,
        max: prixMax
      }
    };
  },
};

export default flashApi;