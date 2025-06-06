// notification.api.js

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
      errorData.message || errorData.error || 'Une erreur est survenue',
      response.status
    );
  }
  return response.json();
};

// API des notifications
export const notificationApi = {
  // Récupérer toutes les notifications de l'utilisateur
  getNotifications: async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/notifications`, {
        method: 'GET',
        ...apiConfig,
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('Erreur lors de la récupération des notifications:', error);
      throw error;
    }
  },

  // Récupérer le nombre de notifications non lues
  getUnreadCount: async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/notifications/unread-count`, {
        method: 'GET',
        ...apiConfig,
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('Erreur lors de la récupération du nombre de notifications non lues:', error);
      throw error;
    }
  },

  // Marquer une notification comme lue
  markAsRead: async (notificationId) => {
    try {
      const response = await fetch(`${BASE_URL}/api/notifications/${notificationId}/read`, {
        method: 'PUT',
        ...apiConfig,
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('Erreur lors du marquage de la notification comme lue:', error);
      throw error;
    }
  },

  // Marquer toutes les notifications comme lues
  markAllAsRead: async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/notifications/mark-all-read`, {
        method: 'PUT',
        ...apiConfig,
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('Erreur lors du marquage de toutes les notifications comme lues:', error);
      throw error;
    }
  },
};

// Hook personnalisé pour React (optionnel)
export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Charger les notifications
  const loadNotifications = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await notificationApi.getNotifications();
      setNotifications(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Charger le nombre de notifications non lues
  const loadUnreadCount = async () => {
    try {
      const data = await notificationApi.getUnreadCount();
      setUnreadCount(data.count);
    } catch (err) {
      console.error('Erreur lors du chargement du nombre de notifications non lues:', err);
    }
  };

  // Marquer une notification comme lue
  const markNotificationAsRead = async (notificationId) => {
    try {
      await notificationApi.markAsRead(notificationId);
      setNotifications(prev => 
        prev.map(notif => 
          notif._id === notificationId 
            ? { ...notif, lu: true } 
            : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      setError(err.message);
    }
  };

  // Marquer toutes les notifications comme lues
  const markAllNotificationsAsRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, lu: true }))
      );
      setUnreadCount(0);
    } catch (err) {
      setError(err.message);
    }
  };

  return {
    notifications,
    unreadCount,
    loading,
    error,
    loadNotifications,
    loadUnreadCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    setNotifications,
    setUnreadCount,
  };
};

// Fonction utilitaire pour formater les notifications
export const formatNotification = (notification) => {
  const formatDate = (date) => {
    const now = new Date();
    const notifDate = new Date(date);
    const diffInMinutes = Math.floor((now - notifDate) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'À l\'instant';
    if (diffInMinutes < 60) return `Il y a ${diffInMinutes} min`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `Il y a ${diffInHours}h`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `Il y a ${diffInDays}j`;
    
    return notifDate.toLocaleDateString('fr-FR');
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'message': return '💬';
      case 'reservation': return '📅';
      case 'like': return '❤️';
      case 'commentaire': return '💭';
      case 'follow': return '👤';
      default: return '🔔';
    }
  };

  return {
    ...notification,
    formattedDate: formatDate(notification.createdAt),
    icon: getNotificationIcon(notification.type),
  };
};

// Service WebSocket pour les notifications en temps réel (optionnel)
export class NotificationWebSocketService {
  constructor(socket) {
    this.socket = socket;
    this.listeners = new Map();
  }

  // Écouter les nouvelles notifications
  onNewNotification(callback) {
    this.socket.on('newNotification', callback);
    this.listeners.set('newNotification', callback);
  }

  // Écouter les mises à jour de notifications
  onNotificationUpdate(callback) {
    this.socket.on('notificationUpdate', callback);
    this.listeners.set('notificationUpdate', callback);
  }

  // Nettoyer les écouteurs
  cleanup() {
    this.listeners.forEach((callback, event) => {
      this.socket.off(event, callback);
    });
    this.listeners.clear();
  }
}

export default notificationApi;