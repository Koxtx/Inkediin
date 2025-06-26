// hooks/useMessagerie.js - Version compatible avec votre MessagerieContext existant
import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessagerieContext } from '../context/MessagerieContext';
import toast from 'react-hot-toast';

export const useMessagerie = () => {
  const context = useContext(MessagerieContext);
  const navigate = useNavigate();

  if (!context) {
    // Si le contexte n'est pas disponible, créer une version simplifiée
    console.warn('MessagerieContext non disponible, utilisation de la version simplifiée');
    return useSimpleMessagerie();
  }

  const {
    conversations,
    messages,
    loading,
    error,
    sendMessage,
    createNewConversation,
    createReservationConversation,
    loadConversations
  } = context;

  // Fonction pour démarrer une conversation avec un utilisateur
  const startConversationWithUser = (user) => {
    if (!user) {
      toast.error('Utilisateur non spécifié');
      return;
    }

    const conversationId = user._id || user.id;
    const contactInfo = {
      id: conversationId,
      name: user.nom || user.name || 'Utilisateur',
      initials: getInitials(user.nom || user.name),
      status: 'Hors ligne',
      userType: user.userType,
      avatar: user.photoProfil || user.avatar
    };

    try {
      // Créer la conversation localement si la fonction existe
      if (createNewConversation) {
        createNewConversation(conversationId, contactInfo);
      }

      // Naviguer vers la conversation
      navigate(`/conversation/${conversationId}`, {
        state: { contactInfo }
      });
      
      toast.success(`Conversation avec ${contactInfo.name} ouverte`);
    } catch (error) {
      console.error('Erreur lors de l\'ouverture de la conversation:', error);
      toast.error('Impossible d\'ouvrir la conversation');
    }
  };

  // Fonction pour démarrer une conversation de réservation de flash
  const startFlashReservation = async (flash, tatoueur, message) => {
    try {
      if (!createReservationConversation) {
        throw new Error('Fonction de réservation non disponible');
      }

      const reservationData = {
        flashId: flash._id || flash.id,
        tatoueurId: tatoueur._id || tatoueur.id,
        contenu: message
      };

      const response = await createReservationConversation(reservationData);
      
      // Naviguer vers la nouvelle conversation
      navigate(`/conversation/${response.conversation._id}`);
      
      toast.success('Réservation de flash initiée');
      return response;
    } catch (error) {
      console.error('Erreur lors de la création de la réservation:', error);
      toast.error('Erreur lors de la réservation');
      throw error;
    }
  };

  // Fonction pour envoyer un message rapide
  const sendQuickMessage = async (userId, messageContent) => {
    try {
      if (!sendMessage) {
        throw new Error('Fonction d\'envoi non disponible');
      }

      if (hasConversationWith(userId)) {
        const conversation = getConversationWith(userId);
        const conversationId = Object.keys(conversations).find(key => 
          conversations[key].contactInfo?.id === userId
        );
        
        await sendMessage(conversationId, messageContent);
      } else {
        await sendMessage(userId, messageContent);
      }
      
      toast.success('Message envoyé');
      return { success: true };
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
      toast.error('Erreur lors de l\'envoi');
      return { success: false, error: error.message };
    }
  };

  // Fonction utilitaire pour obtenir les initiales
  const getInitials = (name) => {
    if (!name) return "??";
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  // Fonction pour obtenir le nombre total de messages non lus
  const getTotalUnreadCount = () => {
    if (!messages || !Array.isArray(messages)) return 0;
    return messages.reduce((total, msg) => total + (msg.unread || 0), 0);
  };

  // Fonction pour vérifier si une conversation existe avec un utilisateur
  const hasConversationWith = (userId) => {
    if (!conversations) return false;
    return Object.values(conversations).some(conv => 
      conv.contactInfo?.id === userId
    );
  };

  // Fonction pour obtenir une conversation avec un utilisateur spécifique
  const getConversationWith = (userId) => {
    if (!conversations) return null;
    const conversationEntry = Object.entries(conversations).find(([key, conv]) => 
      conv.contactInfo?.id === userId
    );
    return conversationEntry ? conversationEntry[1] : null;
  };

  // Fonction pour ouvrir la messagerie générale
  const openMessaging = () => {
    navigate('/messages');
  };

  return {
    // États du contexte
    conversations: conversations || {},
    messages: messages || [],
    loading: loading || false,
    error: error || null,
    
    // Fonctions principales
    startConversationWithUser,
    startFlashReservation,
    sendQuickMessage,
    openMessaging,
    
    // Fonctions utilitaires
    getTotalUnreadCount,
    hasConversationWith,
    getConversationWith,
    getInitials,
    
    // Fonctions du contexte (si disponibles)
    loadConversations: loadConversations || (() => {}),
    sendMessage: sendMessage || (() => {}),
    createNewConversation: createNewConversation || (() => {}),
  };
};

// Version simplifiée si le contexte n'est pas disponible
const useSimpleMessagerie = () => {
  const navigate = useNavigate();

  const startConversationWithUser = (user) => {
    if (!user) {
      toast.error('Utilisateur non spécifié');
      return;
    }

    const userId = user._id || user.id;
    const userName = user.nom || user.name || 'Utilisateur';
    
    // Navigation simple vers la messagerie avec paramètres
    navigate(`/messages?user=${userId}&name=${encodeURIComponent(userName)}`);
    toast.success(`Redirection vers la conversation avec ${userName}`);
  };

  const sendQuickMessage = async (userId, message) => {
    toast.info('Fonctionnalité de messagerie à implémenter');
    return { success: false, message: 'Messagerie non configurée' };
  };

  const openMessaging = () => {
    navigate('/messages');
  };

  const getInitials = (name) => {
    if (!name) return "??";
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return {
    // États par défaut
    conversations: {},
    messages: [],
    loading: false,
    error: null,
    
    // Fonctions simplifiées
    startConversationWithUser,
    sendQuickMessage,
    openMessaging,
    getInitials,
    
    // Fonctions vides
    startFlashReservation: () => toast.info('Réservation de flash à implémenter'),
    getTotalUnreadCount: () => 0,
    hasConversationWith: () => false,
    getConversationWith: () => null,
    loadConversations: () => {},
    sendMessage: () => {},
    createNewConversation: () => {},
  };
};

export default useMessagerie;