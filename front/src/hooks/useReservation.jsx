import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ReservationContext } from '../context/ReservationContext';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';

export const useReservations = () => {
  const context = useContext(ReservationContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  if (!context) {
    throw new Error('useReservations doit être utilisé dans un ReservationProvider');
  }

  const {
    userReservations,
    artistReservations,
    loading,
    error,
    stats,
    createFlashReservation,
    createCustomReservation,
    updateReservationStatus,
    confirmReservation,
    cancelReservation,
    getUpcomingReservations,
    getPendingReservations,
    getFilteredReservations,
    refreshReservations
  } = context;

  // Fonction pour créer une réservation de flash avec navigation
  const reserveFlash = async (flash, tatoueur, message) => {
    try {
      if (!user) {
        toast.error('Vous devez être connecté pour réserver');
        navigate('/signin');
        return null;
      }

      const reservationData = {
        flashId: flash._id || flash.id,
        tatoueurId: tatoueur._id || tatoueur.id,
        message: message || `Bonjour, je suis intéressé(e) par votre flash à ${flash.prix}€.`,
        flashTitle: flash.title || flash.nom,
        flashPrice: flash.prix
      };

      const reservation = await createFlashReservation(reservationData);
      
      // Naviguer vers la conversation si elle existe
      if (reservation.conversationId) {
        navigate(`/conversation/${reservation.conversationId}`, {
          state: {
            contactInfo: {
              id: tatoueur._id || tatoueur.id,
              name: tatoueur.nom || tatoueur.name || 'Tatoueur',
              initials: getTatoueurInitials(tatoueur),
              status: 'Hors ligne',
              userType: 'tatoueur',
              avatar: tatoueur.photoProfil || tatoueur.avatar
            }
          }
        });
      }

      return reservation;
    } catch (error) {
      console.error('Erreur réservation flash:', error);
      throw error;
    }
  };

  // Fonction pour créer une demande de tatouage personnalisé
  const requestCustomTattoo = async (tatoueur, projectData) => {
    try {
      if (!user) {
        toast.error('Vous devez être connecté pour faire une demande');
        navigate('/signin');
        return null;
      }

      const reservationData = {
        tatoueurId: tatoueur._id || tatoueur.id,
        type: 'custom',
        ...projectData
      };

      const reservation = await createCustomReservation(reservationData);
      
      // Naviguer vers la conversation
      if (reservation.conversationId) {
        navigate(`/conversation/${reservation.conversationId}`, {
          state: {
            contactInfo: {
              id: tatoueur._id || tatoueur.id,
              name: tatoueur.nom || tatoueur.name || 'Tatoueur',
              initials: getTatoueurInitials(tatoueur),
              status: 'Hors ligne',
              userType: 'tatoueur',
              avatar: tatoueur.photoProfil || tatoueur.avatar
            }
          }
        });
      }

      return reservation;
    } catch (error) {
      console.error('Erreur demande custom:', error);
      throw error;
    }
  };

  // Fonction pour accepter une réservation (pour les tatoueurs)
  const acceptReservation = async (reservationId, appointmentData) => {
    try {
      if (user?.userType !== 'tatoueur') {
        throw new Error('Seuls les tatoueurs peuvent accepter des réservations');
      }

      const updatedReservation = await confirmReservation(reservationId, appointmentData);
      
      toast.success('Réservation acceptée et confirmée !');
      return updatedReservation;
    } catch (error) {
      console.error('Erreur acceptation réservation:', error);
      throw error;
    }
  };

  // Fonction pour refuser une réservation (pour les tatoueurs)
  const rejectReservation = async (reservationId, reason = '') => {
    try {
      if (user?.userType !== 'tatoueur') {
        throw new Error('Seuls les tatoueurs peuvent refuser des réservations');
      }

      const updatedReservation = await updateReservationStatus(reservationId, 'rejected', reason);
      
      toast.success('Réservation refusée');
      return updatedReservation;
    } catch (error) {
      console.error('Erreur refus réservation:', error);
      throw error;
    }
  };

  // Fonction pour annuler une réservation
  const cancelUserReservation = async (reservationId, reason = '') => {
    try {
      const updatedReservation = await cancelReservation(reservationId, reason);
      
      toast.success('Réservation annulée');
      return updatedReservation;
    } catch (error) {
      console.error('Erreur annulation réservation:', error);
      throw error;
    }
  };

  // Fonction utilitaire pour obtenir les initiales d'un tatoueur
  const getTatoueurInitials = (tatoueur) => {
    const name = tatoueur.nom || tatoueur.name || 'Tatoueur';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  // Fonction pour obtenir les réservations selon le type d'utilisateur
  const getMyReservations = () => {
    return user?.userType === 'tatoueur' ? artistReservations : userReservations;
  };

  // Fonction pour obtenir les réservations en attente de réponse
  const getPendingResponses = () => {
    if (user?.userType === 'tatoueur') {
      return getPendingReservations();
    } else {
      return userReservations.filter(reservation => reservation.status === 'pending');
    }
  };

  // Fonction pour obtenir les prochains rendez-vous
  const getNextAppointments = () => {
    return getUpcomingReservations().slice(0, 5); // Les 5 prochains
  };

  // Fonction pour obtenir les statistiques selon le type d'utilisateur
  const getMyStats = () => {
    if (user?.userType === 'tatoueur') {
      return {
        ...stats,
        pendingRequests: stats.pending,
        confirmedAppointments: stats.confirmed,
        completedTattoos: stats.completed
      };
    } else {
      return {
        ...stats,
        totalRequests: stats.total,
        pendingRequests: stats.pending,
        confirmedAppointments: stats.confirmed,
        completedTattoos: stats.completed
      };
    }
  };

  // Fonction pour naviguer vers la gestion des réservations
  const goToReservations = () => {
    navigate('/reservations');
  };

  // Fonction pour naviguer vers une conversation de réservation
  const goToReservationConversation = (reservation) => {
    if (reservation.conversationId) {
      navigate(`/conversation/${reservation.conversationId}`);
    } else {
      toast.error('Conversation non trouvée');
    }
  };

  // Fonction pour vérifier si l'utilisateur peut faire des réservations
  const canMakeReservations = () => {
    return user && user.userType === 'client';
  };

  // Fonction pour vérifier si l'utilisateur peut gérer des réservations
  const canManageReservations = () => {
    return user && user.userType === 'tatoueur';
  };

  // Fonction pour obtenir le texte d'état approprié
  const getStatusText = (reservation) => {
    const statusTexts = {
      pending: user?.userType === 'tatoueur' ? 'Nouvelle demande' : 'En attente de réponse',
      confirmed: 'Rendez-vous confirmé',
      cancelled: 'Annulé',
      rejected: 'Refusé',
      completed: 'Terminé',
      in_progress: 'En cours'
    };

    return statusTexts[reservation.status] || reservation.status;
  };

  // Fonction pour obtenir les actions disponibles selon le statut et le type d'utilisateur
  const getAvailableActions = (reservation) => {
    const actions = [];
    
    if (user?.userType === 'tatoueur') {
      switch (reservation.status) {
        case 'pending':
          actions.push(
            { type: 'accept', label: 'Accepter', variant: 'success' },
            { type: 'reject', label: 'Refuser', variant: 'danger' }
          );
          break;
        case 'confirmed':
          actions.push(
            { type: 'reminder', label: 'Rappel', variant: 'info' },
            { type: 'complete', label: 'Terminer', variant: 'success' }
          );
          break;
      }
    } else {
      switch (reservation.status) {
        case 'pending':
          actions.push(
            { type: 'cancel', label: 'Annuler', variant: 'danger' }
          );
          break;
        case 'confirmed':
          actions.push(
            { type: 'reschedule', label: 'Reporter', variant: 'warning' },
            { type: 'cancel', label: 'Annuler', variant: 'danger' }
          );
          break;
      }
    }

    // Actions communes
    actions.push(
      { type: 'view', label: 'Voir détails', variant: 'neutral' },
      { type: 'message', label: 'Message', variant: 'info' }
    );

    return actions;
  };

  // Fonction pour filtrer et trier les réservations
  const getFilteredAndSortedReservations = (filters = {}, sortBy = 'date', sortOrder = 'desc') => {
    let reservations = getFilteredReservations();

    // Tri
    reservations.sort((a, b) => {
      let valueA, valueB;

      switch (sortBy) {
        case 'date':
          valueA = new Date(a.appointmentDate || a.createdAt);
          valueB = new Date(b.appointmentDate || b.createdAt);
          break;
        case 'status':
          valueA = a.status;
          valueB = b.status;
          break;
        case 'client':
          valueA = a.clientName || '';
          valueB = b.clientName || '';
          break;
        default:
          valueA = new Date(a.createdAt);
          valueB = b.createdAt;
      }

      if (sortOrder === 'asc') {
        return valueA > valueB ? 1 : -1;
      } else {
        return valueA < valueB ? 1 : -1;
      }
    });

    return reservations;
  };

  return {
    // États
    reservations: getMyReservations(),
    loading,
    error,
    stats: getMyStats(),

    // Fonctions principales
    reserveFlash,
    requestCustomTattoo,
    acceptReservation,
    rejectReservation,
    cancelUserReservation,

    // Fonctions utilitaires
    getMyReservations,
    getPendingResponses,
    getNextAppointments,
    getStatusText,
    getAvailableActions,
    getFilteredAndSortedReservations,

    // Navigation
    goToReservations,
    goToReservationConversation,

    // Permissions
    canMakeReservations,
    canManageReservations,

    // Rafraîchissement
    refreshReservations,

    // Données dérivées
    pendingCount: getPendingResponses().length,
    upcomingCount: getNextAppointments().length,
    hasReservations: getMyReservations().length > 0,
    
    // Données brutes du contexte (pour les cas avancés)
    context
  };
};

export default useReservations;