import { BASE_URL } from "../utils/url";


const apiRequest = async (url, options = {}) => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers
    },
    ...options
  };

  try {
    const response = await fetch(`${BASE_URL}${url}`, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `Erreur HTTP: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('Erreur API:', error);
    throw error;
  }
};

// API des réservations
export const reservationAPI = {
  // Créer une nouvelle réservation
  createReservation: async (reservationData) => {
    return await apiRequest('/reservations', {
      method: 'POST',
      body: JSON.stringify(reservationData)
    });
  },

  // Répondre à une réservation (tatoueur)
  respondToReservation: async (id, responseData) => {
    return await apiRequest(`/reservations/${id}/repondre`, {
      method: 'PATCH',
      body: JSON.stringify(responseData)
    });
  },

  // Annuler une réservation (client)
  cancelReservation: async (id, cancellationData = {}) => {
    return await apiRequest(`/reservations/${id}/annuler`, {
      method: 'PATCH',
      body: JSON.stringify(cancellationData)
    });
  },

  // Marquer une réservation comme terminée (tatoueur)
  completeReservation: async (id) => {
    return await apiRequest(`/reservations/${id}/terminer`, {
      method: 'PATCH'
    });
  },

  // Récupérer toutes les réservations avec filtres (admin)
  getReservations: async (filters = {}) => {
    const queryParams = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value);
      }
    });

    const queryString = queryParams.toString();
    const url = `/reservations${queryString ? `?${queryString}` : ''}`;
    
    return await apiRequest(url);
  },

  // Récupérer mes réservations
  getMyReservations: async (filters = {}) => {
    const queryParams = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value);
      }
    });

    const queryString = queryParams.toString();
    const url = `/reservations/mes-reservations${queryString ? `?${queryString}` : ''}`;
    
    return await apiRequest(url);
  },

  // Récupérer une réservation par ID
  getReservationById: async (id) => {
    return await apiRequest(`/reservations/${id}`);
  }
};

// Fonctions utilitaires pour les réservations
export const reservationUtils = {
  // Valider les données de réservation
  validateReservationData: (data) => {
    const errors = [];

    if (!data.idFlash) {
      errors.push('L\'ID du flash est requis');
    }

    if (!data.messageClient) {
      errors.push('Le message client est requis');
    } else if (data.messageClient.trim().length < 10) {
      errors.push('Le message doit contenir au moins 10 caractères');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  },

  // Valider les données de réponse
  validateResponseData: (data) => {
    const errors = [];

    if (!data.statut) {
      errors.push('Le statut est requis');
    } else if (!['confirmee', 'annulee_tatoueur'].includes(data.statut)) {
      errors.push('Statut invalide. Utilisez "confirmee" ou "annulee_tatoueur"');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  },

  // Formatter les statuts pour l'affichage
  formatStatus: (status) => {
    const statusMap = {
      'en_attente': 'En attente',
      'confirmee': 'Confirmée',
      'annulee_client': 'Annulée par le client',
      'annulee_tatoueur': 'Annulée par le tatoueur',
      'terminee': 'Terminée'
    };
    return statusMap[status] || status;
  },

  // Obtenir la couleur du statut
  getStatusColor: (status) => {
    const colorMap = {
      'en_attente': 'orange',
      'confirmee': 'green',
      'annulee_client': 'red',
      'annulee_tatoueur': 'red',
      'terminee': 'blue'
    };
    return colorMap[status] || 'gray';
  },

  // Vérifier si une réservation peut être annulée
  canBeCancelled: (reservation) => {
    return ['en_attente', 'confirmee'].includes(reservation.statut);
  },

  // Vérifier si une réservation peut être confirmée/refusée
  canBeResponded: (reservation) => {
    return reservation.statut === 'en_attente';
  },

  // Vérifier si une réservation peut être terminée
  canBeCompleted: (reservation) => {
    return reservation.statut === 'confirmee';
  }
};

// Hooks personnalisés pour React (optionnel)
export const useReservations = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchReservations = async (filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const data = await reservationAPI.getMyReservations(filters);
      setReservations(data.reservations);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createReservation = async (reservationData) => {
    setLoading(true);
    setError(null);
    try {
      const newReservation = await reservationAPI.createReservation(reservationData);
      setReservations(prev => [newReservation, ...prev]);
      return newReservation;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const respondToReservation = async (id, responseData) => {
    setLoading(true);
    setError(null);
    try {
      const updatedReservation = await reservationAPI.respondToReservation(id, responseData);
      setReservations(prev => 
        prev.map(res => res._id === id ? updatedReservation : res)
      );
      return updatedReservation;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const cancelReservation = async (id, cancellationData = {}) => {
    setLoading(true);
    setError(null);
    try {
      const updatedReservation = await reservationAPI.cancelReservation(id, cancellationData);
      setReservations(prev => 
        prev.map(res => res._id === id ? updatedReservation : res)
      );
      return updatedReservation;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const completeReservation = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const updatedReservation = await reservationAPI.completeReservation(id);
      setReservations(prev => 
        prev.map(res => res._id === id ? updatedReservation : res)
      );
      return updatedReservation;
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
    fetchReservations,
    createReservation,
    respondToReservation,
    cancelReservation,
    completeReservation
  };
};

// Exemple d'utilisation
export const reservationExamples = {
  // Créer une réservation
  createExample: async () => {
    try {
      const reservationData = {
        idFlash: '507f1f77bcf86cd799439011',
        messageClient: 'Bonjour, je suis très intéressé par ce flash. Pouvez-vous me confirmer la disponibilité ?'
      };

      const validation = reservationUtils.validateReservationData(reservationData);
      if (!validation.isValid) {
        console.error('Erreurs de validation:', validation.errors);
        return;
      }

      const newReservation = await reservationAPI.createReservation(reservationData);
      console.log('Réservation créée:', newReservation);
    } catch (error) {
      console.error('Erreur lors de la création:', error);
    }
  },

  // Répondre à une réservation
  respondExample: async () => {
    try {
      const responseData = {
        statut: 'confirmee',
        messageTatoueur: 'Parfait ! Je confirme votre réservation. Contactez-moi pour fixer un rendez-vous.'
      };

      const validation = reservationUtils.validateResponseData(responseData);
      if (!validation.isValid) {
        console.error('Erreurs de validation:', validation.errors);
        return;
      }

      const updatedReservation = await reservationAPI.respondToReservation(
        '507f1f77bcf86cd799439011',
        responseData
      );
      console.log('Réponse envoyée:', updatedReservation);
    } catch (error) {
      console.error('Erreur lors de la réponse:', error);
    }
  },

  // Récupérer les réservations avec filtres
  fetchExample: async () => {
    try {
      const filters = {
        statut: 'en_attente',
        page: 1,
        limit: 10
      };

      const data = await reservationAPI.getMyReservations(filters);
      console.log('Réservations récupérées:', data);
    } catch (error) {
      console.error('Erreur lors de la récupération:', error);
    }
  }
};

export default reservationAPI;