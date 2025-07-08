import React, { useState, useContext, useEffect, useMemo, useCallback } from 'react';
import { 
  Calendar, 
  Clock, 
  User, 
  MapPin, 
  MessageCircle,
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Filter,
  Search,
  Eye,
  Bell,
  MoreVertical,
  ChevronDown,
  ChevronUp,
  Star,
  DollarSign,
  Tag,
  Users,
  TrendingUp,
  Activity,
  RefreshCw,
  X
} from 'lucide-react';

// Mock context providers for demo
const mockReservationContext = {
  userReservations: [],
  artistReservations: [],
  loading: false,
  error: null,
  stats: {
    total: 15,
    pending: 3,
    confirmed: 7,
    completed: 4,
    cancelled: 1,
    rejected: 0,
    confirmationRate: 85
  },
  filters: { search: '', status: '', type: '' },
  getFilteredReservations: () => mockReservations,
  getGroupedReservations: () => ({
    pending: mockReservations.filter(r => r.status === 'pending'),
    confirmed: mockReservations.filter(r => r.status === 'confirmed'),
    completed: mockReservations.filter(r => r.status === 'completed'),
    cancelled: mockReservations.filter(r => ['cancelled', 'rejected'].includes(r.status))
  }),
  getUpcomingReservations: () => mockReservations.filter(r => 
    new Date(r.appointmentDate) > new Date() && r.status === 'confirmed'
  ),
  updateFilters: () => {},
  resetFilters: () => {},
  refreshReservations: () => {},
  getStatusLabel: (status) => {
    const labels = {
      pending: 'En attente',
      confirmed: 'Confirmé',
      completed: 'Terminé',
      cancelled: 'Annulé',
      rejected: 'Refusé'
    };
    return labels[status] || status;
  },
  getStatusColor: (status) => {
    const colors = {
      pending: 'orange',
      confirmed: 'green',
      completed: 'blue',
      cancelled: 'red',
      rejected: 'red'
    };
    return colors[status] || 'gray';
  },
  getTypeLabel: (type) => {
    const labels = {
      flash: 'Flash Tattoo',
      custom: 'Personnalisé',
      consultation: 'Consultation',
      modification: 'Modification'
    };
    return labels[type] || type;
  },
  formatReservationDate: (date) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  },
  getTimeUntilReservation: (date) => {
    const diff = new Date(date) - new Date();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days > 0) return `dans ${days} jour${days > 1 ? 's' : ''}`;
    if (days === 0) return "aujourd'hui";
    return `il y a ${Math.abs(days)} jour${Math.abs(days) > 1 ? 's' : ''}`;
  },
  canModifyReservation: (reservation) => reservation.status === 'pending' || reservation.status === 'confirmed',
  canCancelReservation: (reservation) => ['pending', 'confirmed'].includes(reservation.status),
  confirmReservation: async (id, data) => console.log('Confirming reservation:', id, data),
  updateReservationStatus: async (id, status, message) => console.log('Updating status:', id, status, message),
  cancelReservation: async (id, message) => console.log('Cancelling reservation:', id, message),
  sendReminder: async (id, message) => console.log('Sending reminder:', id, message)
};

const mockAuthContext = {
  user: {
    _id: '1',
    name: 'Jean Dupont',
    userType: 'tatoueur',
    avatar: null
  }
};

// Mock data
const mockReservations = [
  {
    _id: '1',
    type: 'flash',
    status: 'pending',
    flashTitle: 'Dragon Traditionnel',
    description: 'Un dragon traditionnel japonais en couleur sur l\'avant-bras',
    size: 'Moyen (10-15cm)',
    placement: 'Avant-bras droit',
    budget: 300,
    style: 'Japonais traditionnel',
    client: { name: 'Marie Martin', avatar: null },
    artist: { name: 'Ink Master', avatar: null },
    createdAt: '2024-12-15T10:00:00Z',
    updatedAt: '2024-12-15T10:00:00Z',
    appointmentDate: null
  },
  {
    _id: '2',
    type: 'custom',
    status: 'confirmed',
    projectTitle: 'Portrait Réaliste',
    description: 'Portrait réaliste d\'un proche en noir et gris',
    size: 'Grand (15-20cm)',
    placement: 'Épaule gauche',
    budget: 450,
    style: 'Réalisme',
    client: { name: 'Pierre Durand', avatar: null },
    artist: { name: 'Ink Master', avatar: null },
    createdAt: '2024-12-10T14:30:00Z',
    updatedAt: '2024-12-12T09:15:00Z',
    appointmentDate: '2024-12-20T14:00:00Z',
    location: 'Studio Ink Master, 123 Rue de la Paix, Paris',
    notes: 'Prévoir 3-4 heures de séance'
  },
  {
    _id: '3',
    type: 'consultation',
    status: 'completed',
    projectTitle: 'Consultation Manchette',
    description: 'Discussion pour une manchette complète bras droit',
    client: { name: 'Sophie Leclerc', avatar: null },
    artist: { name: 'Ink Master', avatar: null },
    createdAt: '2024-12-01T16:00:00Z',
    updatedAt: '2024-12-05T11:00:00Z',
    appointmentDate: '2024-12-05T11:00:00Z'
  }
];

const ReservationContext = React.createContext(mockReservationContext);
const AuthContext = React.createContext(mockAuthContext);

export default function ReservationManagement() {
  const reservationContext = useContext(ReservationContext) || mockReservationContext;
  const authContext = useContext(AuthContext) || mockAuthContext;
  
  const { 
    stats,
    filters,
    loading,
    error,
    getFilteredReservations,
    getGroupedReservations,
    getUpcomingReservations,
    updateFilters,
    resetFilters,
    refreshReservations,
    getStatusLabel,
    getStatusColor,
    getTypeLabel,
    formatReservationDate,
    getTimeUntilReservation,
    canModifyReservation,
    canCancelReservation,
    confirmReservation,
    updateReservationStatus,
    cancelReservation,
    sendReminder
  } = reservationContext;

  const { user } = authContext;

  // Local state
  const [activeTab, setActiveTab] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [appointmentData, setAppointmentData] = useState({
    date: '',
    time: '',
    location: '',
    notes: ''
  });

  // Load data on mount
  useEffect(() => {
    if (refreshReservations) {
      refreshReservations();
    }
  }, [refreshReservations]);

  // Get reservations for active tab with memoization
  const currentReservations = useMemo(() => {
    if (!getGroupedReservations || !getFilteredReservations || !getUpcomingReservations) {
      return [];
    }

    const groupedReservations = getGroupedReservations();
    
    switch (activeTab) {
      case 'pending':
        return groupedReservations.pending || [];
      case 'confirmed':
        return groupedReservations.confirmed || [];
      case 'completed':
        return groupedReservations.completed || [];
      case 'cancelled':
        return [...(groupedReservations.cancelled || []), ...(groupedReservations.rejected || [])];
      case 'upcoming':
        return getUpcomingReservations();
      default:
        return getFilteredReservations();
    }
  }, [activeTab, getGroupedReservations, getFilteredReservations, getUpcomingReservations]);

  // Handlers
  const handleRefresh = useCallback(async () => {
    if (refreshReservations) {
      setIsRefreshing(true);
      try {
        await refreshReservations();
      } finally {
        setIsRefreshing(false);
      }
    }
  }, [refreshReservations]);

  const handleConfirmReservation = useCallback(async () => {
    if (!selectedReservation || !confirmReservation) return;

    try {
      const appointmentDateTime = appointmentData.date && appointmentData.time 
        ? new Date(`${appointmentData.date}T${appointmentData.time}`)
        : null;
      
      await confirmReservation(selectedReservation._id, {
        appointmentDate: appointmentDateTime,
        location: appointmentData.location,
        notes: appointmentData.notes
      });
      
      setShowConfirmModal(false);
      setSelectedReservation(null);
      setAppointmentData({ date: '', time: '', location: '', notes: '' });
    } catch (err) {
      console.error('Erreur confirmation:', err);
    }
  }, [selectedReservation, appointmentData, confirmReservation]);

  const handleStatusUpdate = useCallback(async () => {
    if (!selectedReservation) return;

    try {
      if (newStatus === 'cancelled' && cancelReservation) {
        await cancelReservation(selectedReservation._id, statusMessage);
      } else if (updateReservationStatus) {
        await updateReservationStatus(selectedReservation._id, newStatus, statusMessage);
      }
      
      setShowStatusModal(false);
      setSelectedReservation(null);
      setNewStatus('');
      setStatusMessage('');
    } catch (err) {
      console.error('Erreur mise à jour statut:', err);
    }
  }, [selectedReservation, newStatus, statusMessage, cancelReservation, updateReservationStatus]);

  // Status Badge Component
  const StatusBadge = ({ status }) => {
    const color = getStatusColor ? getStatusColor(status) : 'gray';
    const label = getStatusLabel ? getStatusLabel(status) : status;
    
    const colorClasses = {
      green: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      orange: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      red: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      blue: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      purple: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      gray: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colorClasses[color] || colorClasses.gray}`}>
        {label}
      </span>
  );
};
  };

  // Reservation Card Component
  const ReservationCard = ({ reservation }) => {
    const isArtist = user?.userType === 'tatoueur';
    const clientInfo = isArtist ? reservation.client : null;
    const artistInfo = !isArtist ? reservation.artist : null;
    const canModify = canModifyReservation ? canModifyReservation(reservation) : false;
    const canCancel = canCancelReservation ? canCancelReservation(reservation) : false;

    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-200 hover:shadow-lg">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {/* Avatar */}
              <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center overflow-hidden">
                {isArtist ? (
                  clientInfo?.avatar ? (
                    <img src={clientInfo.avatar} alt={clientInfo.name} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-5 h-5 text-gray-500" />
                  )
                ) : (
                  artistInfo?.avatar ? (
                    <img src={artistInfo.avatar} alt={artistInfo.name} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-5 h-5 text-gray-500" />
                  )
                )}
              </div>
              
              {/* User info */}
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {isArtist ? (clientInfo?.name || 'Client') : (artistInfo?.name || 'Artiste')}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {getTypeLabel ? getTypeLabel(reservation.type) : reservation.type}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <StatusBadge status={reservation.status} />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          {/* Title/Description */}
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white">
              {reservation.type === 'flash' ? 
                (reservation.flashTitle || 'Flash Tattoo') : 
                (reservation.projectTitle || 'Projet personnalisé')
              }
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
              {reservation.description || reservation.message || 'Aucune description'}
            </p>
          </div>

          {/* Project details */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            {reservation.size && (
              <div className="flex items-center space-x-2">
                <Tag className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600 dark:text-gray-400">Taille: {reservation.size}</span>
              </div>
            )}
            
            {reservation.placement && (
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600 dark:text-gray-400">{reservation.placement}</span>
              </div>
            )}
            
            {reservation.budget && (
              <div className="flex items-center space-x-2">
                <DollarSign className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600 dark:text-gray-400">Budget: {reservation.budget}€</span>
              </div>
            )}

            {reservation.style && (
              <div className="flex items-center space-x-2">
                <Star className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600 dark:text-gray-400">Style: {reservation.style}</span>
              </div>
            )}
          </div>

          {/* Appointment date */}
          {reservation.appointmentDate && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  {formatReservationDate ? 
                    formatReservationDate(reservation.appointmentDate) : 
                    new Date(reservation.appointmentDate).toLocaleDateString('fr-FR')
                  }
                </span>
                <span className="text-xs text-blue-600 dark:text-blue-400">
                  ({getTimeUntilReservation ? getTimeUntilReservation(reservation.appointmentDate) : ''})
                </span>
              </div>
            </div>
          )}

          {/* Important dates */}
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>Créée le {new Date(reservation.createdAt).toLocaleDateString('fr-FR')}</span>
            {reservation.updatedAt && reservation.updatedAt !== reservation.createdAt && (
              <span>Modifiée le {new Date(reservation.updatedAt).toLocaleDateString('fr-FR')}</span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
          <div className="flex items-center justify-between">
            <div className="flex space-x-2">
              <button
                onClick={() => {
                  setSelectedReservation(reservation);
                  setShowDetailModal(true);
                }}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-600 hover:bg-gray-50 dark:hover:bg-gray-500 transition-colors"
              >
                <Eye className="w-4 h-4 mr-1" />
                Voir
              </button>
              
              <button className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-600 hover:bg-gray-50 dark:hover:bg-gray-500 transition-colors">
                <MessageCircle className="w-4 h-4 mr-1" />
                Message
              </button>
            </div>

            {/* Status-specific actions */}
            <div className="flex space-x-2">
              {isArtist && reservation.status === 'pending' && (
                <>
                  <button
                    onClick={() => {
                      setSelectedReservation(reservation);
                      setNewStatus('rejected');
                      setShowStatusModal(true);
                    }}
                    className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 dark:bg-red-900 dark:text-red-200 dark:hover:bg-red-800 transition-colors"
                  >
                    <XCircle className="w-4 h-4 mr-1" />
                    Refuser
                  </button>
                  <button
                    onClick={() => {
                      setSelectedReservation(reservation);
                      setShowConfirmModal(true);
                    }}
                    className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200 dark:bg-green-900 dark:text-green-200 dark:hover:bg-green-800 transition-colors"
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Accepter
                  </button>
                </>
              )}
              
              {reservation.status === 'confirmed' && sendReminder && (
                <button
                  onClick={() => sendReminder(reservation._id, 'Rappel de votre rendez-vous')}
                  className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:hover:bg-blue-800 transition-colors"
                >
                  <Bell className="w-4 h-4 mr-1" />
                  Rappel
                </button>
              )}
              
              {canCancel && (
                <button
                  onClick={() => {
                    setSelectedReservation(reservation);
                    setNewStatus('cancelled');
                    setShowStatusModal(true);
                  }}
                  className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 dark:bg-red-900 dark:text-red-200 dark:hover:bg-red-800 transition-colors"
                >
                  <XCircle className="w-4 h-4 mr-1" />
                  Annuler
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Stats Cards Component
  const StatsCards = () => (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
      {[
        { icon: Users, label: 'Total', value: stats?.total || 0, color: 'blue' },
        { icon: Clock, label: 'En attente', value: stats?.pending || 0, color: 'orange' },
        { icon: CheckCircle, label: 'Confirmées', value: stats?.confirmed || 0, color: 'green' },
        { icon: Activity, label: 'Terminées', value: stats?.completed || 0, color: 'blue' },
        { icon: TrendingUp, label: 'Taux confirmation', value: `${stats?.confirmationRate || 0}%`, color: 'purple' }
      ].map((stat, index) => (
        <div key={index} className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <stat.icon className={`w-8 h-8 text-${stat.color}-500`} />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.label}</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stat.value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  // Guard against missing user
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Accès non autorisé
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Vous devez être connecté pour accéder à cette page.
          </p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'all', label: 'Toutes', count: stats?.total || 0 },
    { id: 'pending', label: 'En attente', count: stats?.pending || 0 },
    { id: 'confirmed', label: 'Confirmées', count: stats?.confirmed || 0 },
    { id: 'upcoming', label: 'À venir', count: getUpcomingReservations ? getUpcomingReservations().length : 0 },
    { id: 'completed', label: 'Terminées', count: stats?.completed || 0 },
    { id: 'cancelled', label: 'Annulées', count: (stats?.cancelled || 0) + (stats?.rejected || 0) }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Gestion des Réservations
            </h1>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filtres
                {showFilters ? <ChevronUp className="w-4 h-4 ml-2" /> : <ChevronDown className="w-4 h-4 ml-2" />}
              </button>
              
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                Actualiser
              </button>
            </div>
          </div>

          {/* Statistics */}
          <StatsCards />
        </div>

        {/* Filters */}
        {showFilters && updateFilters && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Recherche
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Rechercher..."
                    value={filters?.search || ''}
                    onChange={(e) => updateFilters({ search: e.target.value })}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Statut
                </label>
                <select
                  value={filters?.status || ''}
                  onChange={(e) => updateFilters({ status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="">Tous les statuts</option>
                  <option value="pending">En attente</option>
                  <option value="confirmed">Confirmé</option>
                  <option value="completed">Terminé</option>
                  <option value="cancelled">Annulé</option>
                  <option value="rejected">Refusé</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Type
                </label>
                <select
                  value={filters?.type || ''}
                  onChange={(e) => updateFilters({ type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="">Tous les types</option>
                  <option value="flash">Flash Tattoo</option>
                  <option value="custom">Personnalisé</option>
                  <option value="consultation">Consultation</option>
                  <option value="modification">Modification</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={resetFilters}
                  className="w-full px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 rounded-md hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors"
                >
                  Réinitialiser
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-red-500 text-red-600 dark:text-red-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                  {tab.count > 0 && (
                    <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                      activeTab === tab.id
                        ? 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-200'
                        : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-500 border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Chargement des réservations...</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                  Erreur de chargement
                </h3>
                <p className="text-sm text-red-700 dark:text-red-300 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Reservations List */}
        {!loading && !error && (
          <div className="space-y-4">
            {currentReservations.length > 0 ? (
              currentReservations.map((reservation) => (
                <ReservationCard key={reservation._id} reservation={reservation} />
              ))
            ) : (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Aucune réservation trouvée
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {activeTab === 'all' 
                    ? "Vous n'avez encore aucune réservation."
                    : `Aucune réservation ${activeTab} pour le moment.`
                  }
                </p>
              </div>
            )}
          </div>
        )}

        {/* Confirmation Modal */}
        {showConfirmModal && selectedReservation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Confirmer la réservation
                  </h3>
                  <button
                    onClick={() => {
                      setShowConfirmModal(false);
                      setSelectedReservation(null);
                      setAppointmentData({ date: '', time: '', location: '', notes: '' });
                    }}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Date du rendez-vous *
                    </label>
                    <input
                      type="date"
                      value={appointmentData.date}
                      onChange={(e) => setAppointmentData(prev => ({ ...prev, date: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Heure *
                    </label>
                    <input
                      type="time"
                      value={appointmentData.time}
                      onChange={(e) => setAppointmentData(prev => ({ ...prev, time: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Lieu
                    </label>
                    <input
                      type="text"
                      placeholder="Adresse du studio..."
                      value={appointmentData.location}
                      onChange={(e) => setAppointmentData(prev => ({ ...prev, location: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Notes
                    </label>
                    <textarea
                      placeholder="Instructions particulières..."
                      value={appointmentData.notes}
                      onChange={(e) => setAppointmentData(prev => ({ ...prev, notes: e.target.value }))}
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div className="flex space-x-3 mt-6">
                  <button
                    onClick={() => {
                      setShowConfirmModal(false);
                      setSelectedReservation(null);
                      setAppointmentData({ date: '', time: '', location: '', notes: '' });
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleConfirmReservation}
                    disabled={!appointmentData.date || !appointmentData.time}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    Confirmer
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Status Update Modal */}
        {showStatusModal && selectedReservation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    {newStatus === 'cancelled' ? 'Annuler la réservation' : 'Refuser la réservation'}
                  </h3>
                  <button
                    onClick={() => {
                      setShowStatusModal(false);
                      setSelectedReservation(null);
                      setNewStatus('');
                      setStatusMessage('');
                    }}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Raison
                  </label>
                  <textarea
                    placeholder={newStatus === 'cancelled' ? 'Raison de l\'annulation...' : 'Raison du refus...'}
                    value={statusMessage}
                    onChange={(e) => setStatusMessage(e.target.value)}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
                
                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      setShowStatusModal(false);
                      setSelectedReservation(null);
                      setNewStatus('');
                      setStatusMessage('');
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleStatusUpdate}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                  >
                    {newStatus === 'cancelled' ? 'Annuler' : 'Refuser'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Detail Modal */}
        {showDetailModal && selectedReservation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Détails de la réservation
                  </h3>
                  <button
                    onClick={() => {
                      setShowDetailModal(false);
                      setSelectedReservation(null);
                    }}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* General Information */}
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-3">Informations générales</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Type:</span>
                        <p className="font-medium">{getTypeLabel ? getTypeLabel(selectedReservation.type) : selectedReservation.type}</p>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Statut:</span>
                        <div className="mt-1">
                          <StatusBadge status={selectedReservation.status} />
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Créée le:</span>
                        <p className="font-medium">{new Date(selectedReservation.createdAt).toLocaleDateString('fr-FR')}</p>
                      </div>
                      {selectedReservation.appointmentDate && (
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Rendez-vous:</span>
                          <p className="font-medium">
                            {formatReservationDate ? 
                              formatReservationDate(selectedReservation.appointmentDate) : 
                              new Date(selectedReservation.appointmentDate).toLocaleDateString('fr-FR')
                            }
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Project Description */}
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-3">Description</h4>
                    <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                      {selectedReservation.description || selectedReservation.message || 'Aucune description fournie'}
                    </p>
                  </div>

                  {/* Project Details */}
                  {(selectedReservation.size || selectedReservation.style || selectedReservation.placement || selectedReservation.budget) && (
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-3">Détails du projet</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        {selectedReservation.style && (
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Style:</span>
                            <p className="font-medium">{selectedReservation.style}</p>
                          </div>
                        )}
                        {selectedReservation.size && (
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Taille:</span>
                            <p className="font-medium">{selectedReservation.size}</p>
                          </div>
                        )}
                        {selectedReservation.placement && (
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Emplacement:</span>
                            <p className="font-medium">{selectedReservation.placement}</p>
                          </div>
                        )}
                        {selectedReservation.budget && (
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Budget:</span>
                            <p className="font-medium">{selectedReservation.budget}€</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Additional Notes */}
                  {selectedReservation.notes && (
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-3">Notes</h4>
                      <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                        {selectedReservation.notes}
                      </p>
                    </div>
                  )}

                  {/* Location */}
                  {selectedReservation.location && (
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-3">Lieu</h4>
                      <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                        {selectedReservation.location}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex justify-end mt-6">
                  <button
                    onClick={() => {
                      setShowDetailModal(false);
                      setSelectedReservation(null);
                    }}
                    className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      </div>
    )