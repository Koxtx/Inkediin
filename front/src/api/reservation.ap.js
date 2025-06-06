// reservation.api.js

import { BASE_URL } from "../utils/url";

// Configuration de base pour les requêtes
const apiConfig = {
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include', // Pour inclure les cookies d'authentification
};

// Classe pour gérer les erreurs API
class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

// Fonction utilitaire pour gérer les réponses
const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(
      errorData.error || errorData.message || 'Une erreur est survenue',
      response.status
    );
  }
  return response.json();
};

// API des réservations
export const reservationApi = {
  // Créer une nouvelle réservation
  createReservation: async (reservationData) => {
    try {
      const { idFlash, messageClient } = reservationData;
      
      if (!idFlash || !messageClient) {
        throw new ApiError('Flash ID et message client requis', 400);
      }

      if (messageClient.trim().length < 10) {
        throw new ApiError('Le message doit contenir au moins 10 caractères', 400);
      }

      const response = await fetch(`${BASE_URL}/api/reservations`, {
        method: 'POST',
        ...apiConfig,
        body: JSON.stringify({
          idFlash,
          messageClient: messageClient.trim()
        }),
      });
      
      return await handleResponse(response);
    } catch (error) {
      console.error('Erreur lors de la création de la réservation:', error);
      throw error;
    }
  },

  // Répondre à une réservation (tatoueur)
  respondToReservation: async (reservationId, responseData) => {
    try {
      const { statut, messageTatoueur } = responseData;

      if (!['confirmee', 'annulee_tatoueur'].includes(statut)) {
        throw new ApiError("Statut invalide. Utilisez 'confirmee' ou 'annulee_tatoueur'", 400);
      }

      const response = await fetch(`${BASE_URL}/api/reservations/${reservationId}/repondre`, {
        method: 'PATCH',
        ...apiConfig,
        body: JSON.stringify({
          statut,
          messageTatoueur: messageTatoueur ? messageTatoueur.trim() : ''
        }),
      });
      
      return await handleResponse(response);
    } catch (error) {
      console.error('Erreur lors de la réponse à la réservation:', error);
      throw error;
    }
  },

  // Annuler une réservation (client)
  cancelReservation: async (reservationId, raisonAnnulation = '') => {
    try {
      const response = await fetch(`${BASE_URL}/api/reservations/${reservationId}/annuler`, {
        method: 'PATCH',
        ...apiConfig,
        body: JSON.stringify({
          raisonAnnulation: raisonAnnulation.trim()
        }),
      });
      
      return await handleResponse(response);
    } catch (error) {
      console.error('Erreur lors de l\'annulation de la réservation:', error);
      throw error;
    }
  },

  // Marquer une réservation comme terminée (tatoueur)
  completeReservation: async (reservationId) => {
    try {
      const response = await fetch(`${BASE_URL}/api/reservations/${reservationId}/terminer`, {
        method: 'PATCH',
        ...apiConfig,
      });
      
      return await handleResponse(response);
    } catch (error) {
      console.error('Erreur lors de la finalisation de la réservation:', error);
      throw error;
    }
  },

  // Récupérer toutes les réservations avec filtres (admin)
  getAllReservations: async (filters = {}) => {
    try {
      const {
        statut,
        client,
        tatoueur,
        page = 1,
        limit = 10
      } = filters;

      const queryParams = new URLSearchParams();
      if (statut) queryParams.append('statut', statut);
      if (client) queryParams.append('client', client);
      if (tatoueur) queryParams.append('tatoueur', tatoueur);
      queryParams.append('page', page.toString());
      queryParams.append('limit', limit.toString());

      const response = await fetch(`${BASE_URL}/api/reservations?${queryParams}`, {
        method: 'GET',
        ...apiConfig,
      });
      
      return await handleResponse(response);
    } catch (error) {
      console.error('Erreur lors de la récupération des réservations:', error);
      throw error;
    }
  },

  // Récupérer les réservations de l'utilisateur connecté
  getMyReservations: async (filters = {}) => {
    try {
      const {
        statut,
        page = 1,
        limit = 10
      } = filters;

      const queryParams = new URLSearchParams();
      if (statut) queryParams.append('statut', statut);
      queryParams.append('page', page.toString());
      queryParams.append('limit', limit.toString());

      const response = await fetch(`${BASE_URL}/api/reservations/mes-reservations?${queryParams}`, {
        method: 'GET',
        ...apiConfig,
      });
      
      return await handleResponse(response);
    } catch (error) {
      console.error('Erreur lors de la récupération de mes réservations:', error);
      throw error;
    }
  },

  // Récupérer une réservation par ID
  getReservationById: async (reservationId) => {
    try {
      const response = await fetch(`${BASE_URL}/api/reservations/${reservationId}`, {
        method: 'GET',
        ...apiConfig,
      });
      
      return await handleResponse(response);
    } catch (error) {
      console.error('Erreur lors de la récupération de la réservation:', error);
      throw error;
    }
  },
};

// Hook personnalisé pour React
export const useReservations = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0
  });

  // Charger les réservations de l'utilisateur
  const loadMyReservations = async (filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const data = await reservationApi.getMyReservations(filters);
      setReservations(data.reservations);
      setPagination({
        currentPage: data.currentPage,
        totalPages: data.totalPages,
        total: data.total
      });
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Créer une nouvelle réservation
  const createNewReservation = async (reservationData) => {
    setLoading(true);
    setError(null);
    try {
      const newReservation = await reservationApi.createReservation(reservationData);
      setReservations(prev => [newReservation, ...prev]);
      return newReservation;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Répondre à une réservation
  const respondToReservation = async (reservationId, responseData) => {
    setLoading(true);
    setError(null);
    try {
      const updatedReservation = await reservationApi.respondToReservation(reservationId, responseData);
      setReservations(prev =>
        prev.map(res =>
          res._id === reservationId ? updatedReservation : res
        )
      );
      return updatedReservation;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Annuler une réservation
  const cancelReservation = async (reservationId, reason = '') => {
    setLoading(true);
    setError(null);
    try {
      const updatedReservation = await reservationApi.cancelReservation(reservationId, reason);
      setReservations(prev =>
        prev.map(res =>
          res._id === reservationId ? updatedReservation : res
        )
      );
      return updatedReservation;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Terminer une réservation
  const completeReservation = async (reservationId) => {
    setLoading(true);
    setError(null);
    try {
      const updatedReservation = await reservationApi.completeReservation(reservationId);
      setReservations(prev =>
        prev.map(res =>
          res._id === reservationId ? updatedReservation : res
        )
      );
      return updatedReservation;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Récupérer une réservation spécifique
  const getReservation = async (reservationId) => {
    setLoading(true);
    setError(null);
    try {
      const reservation = await reservationApi.getReservationById(reservationId);
      return reservation;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    reservations,
    loading,
    error,
    pagination,
    loadMyReservations,
    createNewReservation,
    respondToReservation,
    cancelReservation,
    completeReservation,
    getReservation,
    setReservations,
    setError,
  };
};

// Utilitaires pour les réservations
export const reservationUtils = {
  // Statuts disponibles
  STATUTS: {
    EN_ATTENTE: 'en_attente',
    CONFIRMEE: 'confirmee',
    ANNULEE_CLIENT: 'annulee_client',
    ANNULEE_TATOUEUR: 'annulee_tatoueur',
    TERMINEE: 'terminee'
  },

  // Obtenir le label d'un statut
  getStatutLabel: (statut) => {
    const labels = {
      'en_attente': 'En attente',
      'confirmee': 'Confirmée',
      'annulee_client': 'Annulée par le client',
      'annulee_tatoueur': 'Annulée par le tatoueur',
      'terminee': 'Terminée'
    };
    return labels[statut] || statut;
  },

  // Obtenir la couleur d'un statut pour l'UI
  getStatutColor: (statut) => {
    const colors = {
      'en_attente': 'yellow',
      'confirmee': 'green',
      'annulee_client': 'red',
      'annulee_tatoueur': 'red',
      'terminee': 'blue'
    };
    return colors[statut] || 'gray';
  },

  // Vérifier si une réservation peut être annulée
  canCancel: (reservation, userRole) => {
    if (userRole === 'client') {
      return ['en_attente', 'confirmee'].includes(reservation.statut);
    }
    if (userRole === 'tatoueur') {
      return reservation.statut === 'en_attente';
    }
    return false;
  },

  // Vérifier si une réservation peut être confirmée
  canConfirm: (reservation, userRole) => {
    return userRole === 'tatoueur' && reservation.statut === 'en_attente';
  },

  // Vérifier si une réservation peut être terminée
  canComplete: (reservation, userRole) => {
    return userRole === 'tatoueur' && reservation.statut === 'confirmee';
  },

  // Formater la date de réservation
  formatDate: (date) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  },

  // Calculer le temps écoulé depuis la réservation
  getTimeElapsed: (date) => {
    const now = new Date();
    const reservationDate = new Date(date);
    const diffInHours = Math.floor((now - reservationDate) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Il y a moins d\'une heure';
    if (diffInHours < 24) return `Il y a ${diffInHours}h`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `Il y a ${diffInDays}j`;
    
    return reservationDate.toLocaleDateString('fr-FR');
  },

  // Valider les données de réservation
  validateReservationData: (data) => {
    const errors = [];
    
    if (!data.idFlash) {
      errors.push('L\'ID du flash est requis');
    }
    
    if (!data.messageClient || data.messageClient.trim().length < 10) {
      errors.push('Le message doit contenir au moins 10 caractères');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
};

export default reservationApi;