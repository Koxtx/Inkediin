import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessagerieContext } from '../context/MessagerieContext';

export const useMessagerie = () => {
  const context = useContext(MessagerieContext);
  const navigate = useNavigate();

  if (!context) {
    throw new Error('useMessagerie doit être utilisé dans un MessagerieProvider');
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
    const conversationId = user._id;
    const contactInfo = {
      id: user._id,
      name: user.nom || 'Utilisateur',
      initials: getInitials(user.nom),
      status: 'Hors ligne',
      userType: user.userType,
      avatar: user.photoProfil
    };

    // Créer la conversation localement
    createNewConversation(conversationId, contactInfo);

    // Naviguer vers la conversation
    navigate(`/conversation/${conversationId}`, {
      state: { contactInfo }
    });
  };

  // Fonction pour démarrer une conversation de réservation de flash
  const startFlashReservation = async (flash, tatoueur, message) => {
    try {
      const reservationData = {
        flashId: flash._id,
        tatoueurId: tatoueur._id,
        contenu: message
      };

      const response = await createReservationConversation(reservationData);
      
      // Naviguer vers la nouvelle conversation
      navigate(`/conversation/${response.conversation._id}`);
      
      return response;
    } catch (error) {
      console.error('Erreur lors de la création de la réservation:', error);
      throw error;
    }
  };

  // Fonction utilitaire pour obtenir les initiales
  const getInitials = (name) => {
    if (!name) return "??";
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  // Fonction pour obtenir le nombre total de messages non lus
  const getTotalUnreadCount = () => {
    return messages.reduce((total, msg) => total + (msg.unread || 0), 0);
  };

  // Fonction pour vérifier si une conversation existe avec un utilisateur
  const hasConversationWith = (userId) => {
    return Object.values(conversations).some(conv => 
      conv.contactInfo?.id === userId
    );
  };

  // Fonction pour obtenir une conversation avec un utilisateur spécifique
  const getConversationWith = (userId) => {
    const conversationEntry = Object.entries(conversations).find(([key, conv]) => 
      conv.contactInfo?.id === userId
    );
    return conversationEntry ? conversationEntry[1] : null;
  };

  // Fonction pour envoyer un message rapide
  const sendQuickMessage = async (userId, message) => {
    try {
      if (hasConversationWith(userId)) {
        // Utiliser la conversation existante
        const conversation = getConversationWith(userId);
        const conversationId = Object.keys(conversations).find(key => 
          conversations[key].contactInfo?.id === userId
        );
        
        await sendMessage(conversationId, message);
      } else {
        // Créer une nouvelle conversation
        await sendMessage(userId, message);
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
      throw error;
    }
  };

  return {
    // États
    conversations,
    messages,
    loading,
    error,
    
    // Fonctions utilitaires
    startConversationWithUser,
    startFlashReservation,
    sendQuickMessage,
    getTotalUnreadCount,
    hasConversationWith,
    getConversationWith,
    loadConversations,
    
    // Fonctions du contexte
    ...context
  };
};

export default useMessagerie;