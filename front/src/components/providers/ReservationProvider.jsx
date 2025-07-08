import React, {  useContext, useState, useEffect, useCallback } from 'react';
import { reservationsApi, reservationUtils } from '../../api/reservations.api';
import { AuthContext } from './AuthContext';
import { SocketContext } from './SocketContext';
import toast from 'react-hot-toast';



// Provider du contexte
export default function ReservationProvider({ children }) {
  const { user, currentUserId } = useContext(AuthContext);
  const { socket } = useContext(SocketContext);

  // États principaux
  const [reservations, setReservations] = useState([]);
  const [userReservations, setUserReservations] = useState([]); // Pour les clients
  const [artistReservations, setArtistReservations] = useState([]); // Pour les tatoueurs
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // États pour la pagination et les filtres
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    type: '',
    search: '',
    dateFrom: '',
    dateTo: ''
  });

  // Cache des réservations
  const [reservationCache, setReservationCache] = useState(new Map());

  // États de statistiques
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0,
    rejected: 0,
    confirmationRate: 0
  });

  // Fonction pour mettre à jour une réservation dans le cache
  const updateReservationInCache = useCallback((reservationId, updatedReservation) => {
    setReservationCache(prev => {
      const newCache = new Map(prev);
      newCache.set(reservationId, updatedReservation);
      return newCache;
    });
  }, []);

  // Mettre à jour les statistiques
  const updateStats = useCallback(() => {
    const currentReservations = user?.userType === 'tatoueur' ? artistReservations : userReservations;
    const newStats = reservationUtils.calculateStats(currentReservations);
    setStats(newStats);
  }, [user, artistReservations, userReservations]);

  // Fonction pour mettre à jour une réservation dans toutes les listes
  const updateReservationInAllLists = useCallback((reservationId, updatedReservation) => {
    const updateInList = (setList) => {
      setList(prev => prev.map(reservation =>
        reservation._id === reservationId ? updatedReservation : reservation
      ));
    };

    updateInList(setReservations);
    updateInList(setUserReservations);
    updateInList(setArtistReservations);

    // Mettre à jour le cache
    updateReservationInCache(reservationId, updatedReservation);

    // Recalculer les stats
    updateStats();
  }, [updateReservationInCache, updateStats]);

  // Fonction pour supprimer une réservation de toutes les listes
  const removeReservationFromAllLists = useCallback((reservationId) => {
    const removeFromList = (setList) => {
      setList(prev => prev.filter(reservation => reservation._id !== reservationId));
    };

    removeFromList(setReservations);
    removeFromList(setUserReservations);
    removeFromList(setArtistReservations);

    // Supprimer du cache
    setReservationCache(prev => {
      const newCache = new Map(prev);
      newCache.delete(reservationId);
      return newCache;
    });

    // Recalculer les stats
    updateStats();
  }, [updateStats]);

  // Charger les réservations
  const loadReservations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔄 Chargement des réservations pour:', user?.userType);

      if (user?.userType === 'tatoueur') {
        // Charger les réservations pour le tatoueur
        const artistData = await reservationsApi.getArtistReservations({
          page: 1,
          limit: 50
        });
        console.log('📋 Réservations artiste chargées:', artistData);
        
        const reservationsData = artistData.reservations || artistData.data || [];
        setArtistReservations(reservationsData);
        setReservations(reservationsData);

        // Mettre à jour le cache
        reservationsData.forEach(reservation => {
          updateReservationInCache(reservation._id, reservation);
        });
      } else {
        // Charger les réservations pour le client
        const userData = await reservationsApi.getUserReservations({
          page: 1,
          limit: 50
        });
        console.log('📋 Réservations utilisateur chargées:', userData);
        
        const reservationsData = userData.reservations || userData.data || [];
        setUserReservations(reservationsData);
        setReservations(reservationsData);

        // Mettre à jour le cache
        reservationsData.forEach(reservation => {
          updateReservationInCache(reservation._id, reservation);
        });
      }

      // Mettre à jour les stats
      updateStats();

    } catch (err) {
      console.error('❌ ReservationContext - Erreur chargement réservations:', err);
      setError(err.message || 'Erreur lors du chargement des réservations');
    } finally {
      setLoading(false);
    }
  }, [user, updateReservationInCache, updateStats]);

  // Créer une réservation de flash
  const createFlashReservation = useCallback(async (reservationData) => {
    try {
      console.log('📝 Création réservation flash:', reservationData);

      // Valider les données
      const validationErrors = reservationUtils.validateFlashReservation(reservationData);
      if (validationErrors.length > 0) {
        throw new Error(validationErrors[0]);
      }

      const newReservation = await reservationsApi.createFlashReservation(reservationData);
      console.log('✅ Réservation flash créée:', newReservation);

      // Ajouter à la liste des réservations utilisateur
      setUserReservations(prev => [newReservation, ...prev]);
      setReservations(prev => [newReservation, ...prev]);

      // Mettre à jour le cache
      updateReservationInCache(newReservation._id, newReservation);

      // Recalculer les stats
      updateStats();

      toast.success('Réservation envoyée avec succès !');
      return newReservation;

    } catch (err) {
      console.error('❌ Erreur création réservation flash:', err);
      toast.error(err.message || 'Erreur lors de la création de la réservation');
      throw err;
    }
  }, [updateReservationInCache, updateStats]);

  // Créer une réservation custom
  const createCustomReservation = useCallback(async (reservationData) => {
    try {
      console.log('📝 Création réservation custom:', reservationData);

      // Valider les données
      const validationErrors = reservationUtils.validateCustomReservation(reservationData);
      if (validationErrors.length > 0) {
        throw new Error(validationErrors[0]);
      }

      const newReservation = await reservationsApi.createCustomReservation(reservationData);
      console.log('✅ Réservation custom créée:', newReservation);

      // Ajouter à la liste des réservations utilisateur
      setUserReservations(prev => [newReservation, ...prev]);
      setReservations(prev => [newReservation, ...prev]);

      // Mettre à jour le cache
      updateReservationInCache(newReservation._id, newReservation);

      // Recalculer les stats
      updateStats();

      toast.success('Demande de tatouage personnalisé envoyée !');
      return newReservation;

    } catch (err) {
      console.error('❌ Erreur création réservation custom:', err);
      toast.error(err.message || 'Erreur lors de la création de la réservation');
      throw err;
    }
  }, [updateReservationInCache, updateStats]);

  // Récupérer une réservation par ID
  const getReservationById = useCallback(async (reservationId) => {
    try {
      // Vérifier d'abord le cache
      const cachedReservation = reservationCache.get(reservationId);
      if (cachedReservation) {
        console.log('📋 Réservation trouvée dans le cache:', reservationId);
        return cachedReservation;
      }

      // Sinon, charger depuis l'API
      const reservation = await reservationsApi.getReservationById(reservationId);
      console.log('📋 Réservation chargée depuis l\'API:', reservation);

      // Mettre à jour le cache
      updateReservationInCache(reservationId, reservation);

      return reservation;
    } catch (err) {
      console.error('❌ Erreur récupération réservation:', err);
      throw err;
    }
  }, [reservationCache, updateReservationInCache]);

  // Mettre à jour le statut d'une réservation (pour les tatoueurs)
  const updateReservationStatus = useCallback(async (reservationId, status, message = '') => {
    try {
      console.log('🔄 Mise à jour statut réservation:', { reservationId, status, message });

      const updatedReservation = await reservationsApi.updateReservationStatus(reservationId, status, message);
      
      // Mettre à jour dans toutes les listes
      updateReservationInAllLists(reservationId, updatedReservation);

      const statusLabel = reservationUtils.getStatusLabel(status);
      toast.success(`Réservation ${statusLabel.toLowerCase()}`);

      return updatedReservation;
    } catch (err) {
      console.error('❌ Erreur mise à jour statut:', err);
      toast.error(err.message || 'Erreur lors de la mise à jour');
      throw err;
    }
  }, [updateReservationInAllLists]);

  // Confirmer une réservation avec détails de rendez-vous
  const confirmReservation = useCallback(async (reservationId, appointmentData) => {
    try {
      console.log('✅ Confirmation réservation:', { reservationId, appointmentData });

      const updatedReservation = await reservationsApi.confirmReservation(reservationId, appointmentData);
      
      // Mettre à jour dans toutes les listes
      updateReservationInAllLists(reservationId, updatedReservation);

      toast.success('Réservation confirmée avec succès !');
      return updatedReservation;
    } catch (err) {
      console.error('❌ Erreur confirmation réservation:', err);
      toast.error(err.message || 'Erreur lors de la confirmation');
      throw err;
    }
  }, [updateReservationInAllLists]);

  // Annuler une réservation
  const cancelReservation = useCallback(async (reservationId, reason = '') => {
    try {
      console.log('❌ Annulation réservation:', { reservationId, reason });

      const updatedReservation = await reservationsApi.cancelReservation(reservationId, reason);
      
      // Mettre à jour dans toutes les listes
      updateReservationInAllLists(reservationId, updatedReservation);

      toast.success('Réservation annulée');
      return updatedReservation;
    } catch (err) {
      console.error('❌ Erreur annulation réservation:', err);
      toast.error(err.message || 'Erreur lors de l\'annulation');
      throw err;
    }
  }, [updateReservationInAllLists]);

  // Modifier une réservation
  const updateReservation = useCallback(async (reservationId, updateData) => {
    try {
      console.log('📝 Modification réservation:', { reservationId, updateData });

      const updatedReservation = await reservationsApi.updateReservation(reservationId, updateData);
      
      // Mettre à jour dans toutes les listes
      updateReservationInAllLists(reservationId, updatedReservation);

      toast.success('Réservation modifiée avec succès');
      return updatedReservation;
    } catch (err) {
      console.error('❌ Erreur modification réservation:', err);
      toast.error(err.message || 'Erreur lors de la modification');
      throw err;
    }
  }, [updateReservationInAllLists]);

  // Supprimer une réservation
  const deleteReservation = useCallback(async (reservationId) => {
    try {
      console.log('🗑️ Suppression réservation:', reservationId);

      await reservationsApi.deleteReservation(reservationId);
      
      // Supprimer de toutes les listes
      removeReservationFromAllLists(reservationId);

      toast.success('Réservation supprimée');
    } catch (err) {
      console.error('❌ Erreur suppression réservation:', err);
      toast.error(err.message || 'Erreur lors de la suppression');
      throw err;
    }
  }, [removeReservationFromAllLists]);

  // Marquer une réservation comme terminée
  const completeReservation = useCallback(async (reservationId, completionData) => {
    try {
      console.log('🏁 Finalisation réservation:', { reservationId, completionData });

      const updatedReservation = await reservationsApi.completeReservation(reservationId, completionData);
      
      // Mettre à jour dans toutes les listes
      updateReservationInAllLists(reservationId, updatedReservation);

      toast.success('Réservation marquée comme terminée !');
      return updatedReservation;
    } catch (err) {
      console.error('❌ Erreur finalisation réservation:', err);
      toast.error(err.message || 'Erreur lors de la finalisation');
      throw err;
    }
  }, [updateReservationInAllLists]);

  // Envoyer un rappel
  const sendReminder = useCallback(async (reservationId, message) => {
    try {
      console.log('⏰ Envoi rappel:', { reservationId, message });

      await reservationsApi.sendReminder(reservationId, message);
      
      toast.success('Rappel envoyé !');
    } catch (err) {
      console.error('❌ Erreur envoi rappel:', err);
      toast.error(err.message || 'Erreur lors de l\'envoi du rappel');
      throw err;
    }
  }, []);

  // Filtrer les réservations
  const getFilteredReservations = useCallback(() => {
    const currentReservations = user?.userType === 'tatoueur' ? artistReservations : userReservations;
    return reservationUtils.filterReservations(currentReservations, filters);
  }, [user, artistReservations, userReservations, filters]);

  // Grouper les réservations par statut
  const getGroupedReservations = useCallback(() => {
    const filteredReservations = getFilteredReservations();
    return reservationUtils.groupByStatus(filteredReservations);
  }, [getFilteredReservations]);

  // Obtenir les réservations à venir
  const getUpcomingReservations = useCallback(() => {
    const currentReservations = user?.userType === 'tatoueur' ? artistReservations : userReservations;
    const now = new Date();
    
    return currentReservations
      .filter(reservation => {
        if (!reservation.appointmentDate) return false;
        const appointmentDate = new Date(reservation.appointmentDate);
        return appointmentDate > now && ['confirmed', 'in_progress'].includes(reservation.status);
      })
      .sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate));
  }, [user, artistReservations, userReservations]);

  // Obtenir les réservations en attente (pour les tatoueurs)
  const getPendingReservations = useCallback(() => {
    if (user?.userType !== 'tatoueur') return [];
    
    return artistReservations.filter(reservation => reservation.status === 'pending');
  }, [user, artistReservations]);

  // Rafraîchir les données
  const refreshReservations = useCallback(async () => {
    try {
      setError(null);
      await loadReservations();
    } catch (err) {
      console.error('❌ Erreur refresh réservations:', err);
      setError(err.message);
    }
  }, [loadReservations]);

  // Vider l'erreur
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Mettre à jour les filtres
  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // Réinitialiser les filtres
  const resetFilters = useCallback(() => {
    setFilters({
      status: '',
      type: '',
      search: '',
      dateFrom: '',
      dateTo: ''
    });
  }, []);

  // Charger plus de réservations (pagination)
  const loadMoreReservations = useCallback(async () => {
    if (!hasMore || loading) return;

    try {
      setLoading(true);
      const nextPage = currentPage + 1;

      const apiCall = user?.userType === 'tatoueur' 
        ? reservationsApi.getArtistReservations 
        : reservationsApi.getUserReservations;

      const response = await apiCall({
        page: nextPage,
        limit: 20,
        ...filters
      });

      const newReservations = response.reservations || response.data || [];

      if (newReservations.length > 0) {
        if (user?.userType === 'tatoueur') {
          setArtistReservations(prev => [...prev, ...newReservations]);
        } else {
          setUserReservations(prev => [...prev, ...newReservations]);
        }
        
        setCurrentPage(nextPage);
        setHasMore(nextPage < (response.totalPages || 1));

        // Mettre à jour le cache
        newReservations.forEach(reservation => {
          updateReservationInCache(reservation._id, reservation);
        });
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error('❌ Erreur load more réservations:', err);
    } finally {
      setLoading(false);
    }
  }, [hasMore, loading, currentPage, filters, user, updateReservationInCache]);

  // Gestion des événements WebSocket
  useEffect(() => {
    if (socket && user) {
      console.log('🔗 ReservationContext - Configuration des listeners WebSocket');

      // Nouvelle réservation reçue
      const handleNewReservation = (data) => {
        console.log('📨 Nouvelle réservation reçue:', data);
        const { reservation } = data;

        // Ajouter à la liste appropriée
        if (user.userType === 'tatoueur' && reservation.artistId === currentUserId) {
          setArtistReservations(prev => [reservation, ...prev]);
          toast.success(`Nouvelle réservation de ${reservation.clientName}`);
        } else if (user.userType === 'client' && reservation.clientId === currentUserId) {
          setUserReservations(prev => [reservation, ...prev]);
        }

        // Mettre à jour le cache
        updateReservationInCache(reservation._id, reservation);
      };

      // Statut de réservation mis à jour
      const handleReservationStatusUpdate = (data) => {
        console.log('🔄 Statut réservation mis à jour:', data);
        const { reservationId, status, updatedReservation } = data;

        // Mettre à jour dans toutes les listes
        updateReservationInAllLists(reservationId, updatedReservation);

        // Notification selon le statut
        const statusMessages = {
          confirmed: 'Réservation confirmée !',
          cancelled: 'Réservation annulée',
          rejected: 'Réservation refusée',
          completed: 'Réservation terminée'
        };

        if (statusMessages[status]) {
          toast.success(statusMessages[status]);
        }
      };

      // Réservation supprimée
      const handleReservationDeleted = (data) => {
        console.log('🗑️ Réservation supprimée:', data);
        const { reservationId } = data;

        removeReservationFromAllLists(reservationId);
        toast.info('Réservation supprimée');
      };

      // Rappel de réservation
      const handleReservationReminder = (data) => {
        console.log('⏰ Rappel de réservation:', data);
        const { reservation, message } = data;
        
        toast.info(`Rappel: ${message}`, {
          duration: 6000,
          icon: '⏰'
        });
      };

      // Ajouter les listeners
      socket.on('nouvelleReservation', handleNewReservation);
      socket.on('reservationStatusUpdate', handleReservationStatusUpdate);
      socket.on('reservationDeleted', handleReservationDeleted);
      socket.on('reservationReminder', handleReservationReminder);

      // Nettoyer les listeners
      return () => {
        console.log('🧹 ReservationContext - Nettoyage des listeners WebSocket');
        socket.off('nouvelleReservation', handleNewReservation);
        socket.off('reservationStatusUpdate', handleReservationStatusUpdate);
        socket.off('reservationDeleted', handleReservationDeleted);
        socket.off('reservationReminder', handleReservationReminder);
      };
    }
  }, [socket, user, currentUserId, updateReservationInCache, updateReservationInAllLists, removeReservationFromAllLists]);

  // Charger les réservations au montage
  useEffect(() => {
    if (user) {
      loadReservations();
    }
  }, [user, loadReservations]);

  // Valeurs du contexte
  const value = {
    // États
    reservations,
    userReservations,
    artistReservations,
    loading,
    error,
    stats,
    filters,
    currentPage,
    totalPages,
    hasMore,

    // Fonctions CRUD
    createFlashReservation,
    createCustomReservation,
    getReservationById,
    updateReservationStatus,
    confirmReservation,
    cancelReservation,
    updateReservation,
    deleteReservation,
    completeReservation,
    sendReminder,

    // Fonctions utilitaires
    getFilteredReservations,
    getGroupedReservations,
    getUpcomingReservations,
    getPendingReservations,
    loadReservations,
    refreshReservations,
    loadMoreReservations,

    // Gestion des filtres
    updateFilters,
    resetFilters,

    // Gestion des erreurs
    clearError,

    // Fonctions utilitaires directes
    canModifyReservation: reservationUtils.canModifyReservation,
    canCancelReservation: reservationUtils.canCancelReservation,
    getStatusLabel: reservationUtils.getStatusLabel,
    getStatusColor: reservationUtils.getStatusColor,
    getTypeLabel: reservationUtils.getTypeLabel,
    formatReservationDate: reservationUtils.formatReservationDate,
    getTimeUntilReservation: reservationUtils.getTimeUntilReservation,
  };

  return (
    <ReservationContext.Provider value={value}>
      {children}
    </ReservationContext.Provider>
  );
}