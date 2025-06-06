import { BASE_URL } from "../utils/url";

// Configuration des headers par défaut
const getHeaders = () => {
  const headers = {
    'Content-Type': 'application/json',
  };
  
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

// API de la messagerie
export const messagerieApi = {
  // Récupérer toutes les conversations de l'utilisateur
  getConversations: async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/messageries`, {
        method: 'GET',
        headers: getHeaders(),
      });
      
      return await handleApiError(response);
    } catch (error) {
      console.error('Erreur lors de la récupération des conversations:', error);
      throw error;
    }
  },

  // Récupérer une conversation spécifique avec tous ses messages
  getConversation: async (conversationId) => {
    try {
      const response = await fetch(`${BASE_URL}/api/messageries/${conversationId}`, {
        method: 'GET',
        headers: getHeaders(),
      });
      
      return await handleApiError(response);
    } catch (error) {
      console.error('Erreur lors de la récupération de la conversation:', error);
      throw error;
    }
  },

  // Envoyer un message
  sendMessage: async (messageData) => {
    try {
      const response = await fetch(`${BASE_URL}/api/messageries/send`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(messageData),
      });
      
      return await handleApiError(response);
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
      throw error;
    }
  },

  // Marquer un message comme lu
  markAsRead: async (messageId) => {
    try {
      const response = await fetch(`${BASE_URL}/api/messageries/${messageId}/read`, {
        method: 'PUT',
        headers: getHeaders(),
      });
      
      return await handleApiError(response);
    } catch (error) {
      console.error('Erreur lors du marquage comme lu:', error);
      throw error;
    }
  },

  // Créer une conversation pour une réservation de flash
  createReservationMessage: async (reservationData) => {
    try {
      const response = await fetch(`${BASE_URL}/api/messageries/reservation`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(reservationData),
      });
      
      return await handleApiError(response);
    } catch (error) {
      console.error('Erreur lors de la création du message de réservation:', error);
      throw error;
    }
  },
};

// Fonctions utilitaires pour la messagerie
export const messagerieUtils = {
  // Formater la date d'un message
  formatMessageDate: (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffMinutes = Math.ceil(diffTime / (1000 * 60));
    const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffMinutes < 1) {
      return 'À l\'instant';
    } else if (diffMinutes < 60) {
      return `Il y a ${diffMinutes} min`;
    } else if (diffHours < 24) {
      return `Il y a ${diffHours}h`;
    } else if (diffDays === 1) {
      return 'Hier';
    } else if (diffDays < 7) {
      return `Il y a ${diffDays} jours`;
    } else {
      return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      });
    }
  },

  // Formater l'heure d'un message
  formatMessageTime: (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  },

  // Obtenir le nom d'affichage d'un participant
  getParticipantDisplayName: (participant) => {
    if (!participant) return 'Utilisateur inconnu';
    return participant.nom ? `${participant.nom}` : participant.email;
  },

  // Obtenir l'autre participant dans une conversation (pas l'utilisateur actuel)
  getOtherParticipant: (conversation, currentUserId) => {
    if (!conversation.participants) return null;
    return conversation.participants.find(p => p._id !== currentUserId);
  },

  // Déterminer si un message est envoyé par l'utilisateur actuel
  isOwnMessage: (message, currentUserId) => {
    return message.expediteurId._id === currentUserId || message.expediteurId === currentUserId;
  },

  // Grouper les messages par date
  groupMessagesByDate: (messages) => {
    const groups = {};
    
    messages.forEach(message => {
      const date = new Date(message.dateEnvoi);
      const dateKey = date.toDateString();
      
      if (!groups[dateKey]) {
        groups[dateKey] = {
          date: date,
          messages: []
        };
      }
      
      groups[dateKey].messages.push(message);
    });
    
    return Object.values(groups).sort((a, b) => a.date - b.date);
  },

  // Formater la date de groupe
  formatGroupDate: (date) => {
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Aujourd\'hui';
    } else if (diffDays === 1) {
      return 'Hier';
    } else if (diffDays < 7) {
      return date.toLocaleDateString('fr-FR', { weekday: 'long' });
    } else {
      return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      });
    }
  },

  // Obtenir le statut de la conversation
  getConversationStatus: (conversation) => {
    if (conversation.type === 'reservation_flash') {
      return 'Réservation Flash';
    }
    return 'Conversation';
  },

  // Obtenir l'icône du type de conversation
  getConversationIcon: (conversation) => {
    if (conversation.type === 'reservation_flash') {
      return '⚡';
    }
    return '💬';
  },

  // Compter le total des messages non lus
  getTotalUnreadCount: (conversations) => {
    return conversations.reduce((total, conv) => total + (conv.messagesNonLus || 0), 0);
  },

  // Filtrer les conversations par type
  filterConversationsByType: (conversations, type) => {
    if (!type || type === 'all') return conversations;
    return conversations.filter(conv => conv.type === type);
  },

  // Rechercher dans les conversations
  searchConversations: (conversations, query, currentUserId) => {
    if (!query.trim()) return conversations;
    
    const searchTerm = query.toLowerCase();
    
    return conversations.filter(conv => {
      // Recherche dans le nom des participants
      const otherParticipant = messagerieUtils.getOtherParticipant(conv, currentUserId);
      if (otherParticipant) {
        const participantName = messagerieUtils.getParticipantDisplayName(otherParticipant).toLowerCase();
        if (participantName.includes(searchTerm)) return true;
      }
      
      // Recherche dans le dernier message
      if (conv.dernierMessage && conv.dernierMessage.contenu) {
        if (conv.dernierMessage.contenu.toLowerCase().includes(searchTerm)) return true;
      }
      
      return false;
    });
  },

  // Valider les données d'un message
  validateMessageData: (messageData) => {
    const errors = [];
    
    if (!messageData.contenu || messageData.contenu.trim().length === 0) {
      errors.push('Le contenu du message est requis');
    }
    
    if (messageData.contenu && messageData.contenu.length > 1000) {
      errors.push('Le message ne peut pas dépasser 1000 caractères');
    }
    
    if (!messageData.destinataireId && !messageData.conversationId) {
      errors.push('Destinataire ou conversation requis');
    }
    
    return errors;
  },

  // Valider les données d'une réservation
  validateReservationData: (reservationData) => {
    const errors = [];
    
    if (!reservationData.flashId) {
      errors.push('Flash ID requis');
    }
    
    if (!reservationData.tatoueurId) {
      errors.push('Tatoueur ID requis');
    }
    
    if (!reservationData.contenu || reservationData.contenu.trim().length === 0) {
      errors.push('Message de réservation requis');
    }
    
    if (reservationData.contenu && reservationData.contenu.length > 500) {
      errors.push('Le message de réservation ne peut pas dépasser 500 caractères');
    }
    
    return errors;
  },

  // Créer un message de réservation type
  createReservationTemplate: (flash, customMessage = '') => {
    const baseMessage = `Bonjour, je suis intéressé(e) par votre flash à ${flash.prix}€.`;
    
    if (customMessage.trim()) {
      return `${baseMessage}\n\n${customMessage.trim()}`;
    }
    
    return baseMessage;
  },

  // Extraire le texte de prévisualisation d'un message
  getPreviewText: (message, maxLength = 50) => {
    if (!message.contenu) return '';
    
    const text = message.contenu.trim();
    if (text.length <= maxLength) return text;
    
    return text.substring(0, maxLength).trim() + '...';
  },

  // Déterminer si une conversation nécessite une action
  needsAttention: (conversation, currentUserId) => {
    // Conversation avec messages non lus
    if (conversation.messagesNonLus > 0) return true;
    
    // Conversation de réservation sans réponse récente du tatoueur
    if (conversation.type === 'reservation_flash' && conversation.dernierMessage) {
      const lastMessage = conversation.dernierMessage;
      const isFromClient = messagerieUtils.isOwnMessage(lastMessage, currentUserId);
      const isOld = new Date() - new Date(lastMessage.dateEnvoi) > 24 * 60 * 60 * 1000; // 24h
      
      return isFromClient && isOld;
    }
    
    return false;
  },
};

export default messagerieApi;