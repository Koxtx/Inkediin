import React, { useState, useEffect, useContext } from "react";
import { MessagerieContext } from "../../context/MessagerieContext";
import { messagerieApi } from "../../api/messagerie.api";
import { AuthContext } from "../../context/AuthContext";
import { SocketContext } from "../../context/SocketContext"; 

export default function MessagerieProvider({ children }) {
  const { user } = useContext(AuthContext);
  const { socket } = useContext(SocketContext);

  // État pour les onglets
  const [activeTab, setActiveTab] = useState("Tous");
  const tabs = ["Tous", "Clients", "Tatoueurs", "Non lus"];

  // État pour les messages (liste des conversations)
  const [messages, setMessages] = useState([]);

  // État pour les recherches
  const [searchTerm, setSearchTerm] = useState("");

  // État pour les conversations individuelles
  const [conversations, setConversations] = useState({});

  // État pour le message actuellement en cours de rédaction
  const [newMessage, setNewMessage] = useState("");

  // État pour la conversation active
  const [activeConversation, setActiveConversation] = useState(null);

  // États de chargement et d'erreur
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Charger les conversations au montage du composant
  useEffect(() => {
    if (user) {
      loadConversations();
    }
  }, [user]);

  // Gestion des événements WebSocket
  useEffect(() => {
    if (socket && user) {
     

      // Écouter les nouveaux messages
      const handleNewMessage = (data) => {
       
        const { message, conversationId } = data;

        // Ajouter le message à la conversation correspondante
        setConversations((prev) => {
          const conversation = prev[conversationId];
          if (!conversation) {
            // Si la conversation n'existe pas, recharger toutes les conversations
            setTimeout(() => loadConversations(), 500);
            return prev;
          }

          const newMessage = {
            id: message._id,
            content: message.contenu,
            time: formatTime(message.dateEnvoi),
            sent: message.expediteurId._id === user._id,
            edited: false,
          };

          return {
            ...prev,
            [conversationId]: {
              ...conversation,
              messages: [...(conversation.messages || []), newMessage],
            },
          };
        });

        // Mettre à jour la liste des conversations
        setMessages((prev) => {
          const index = prev.findIndex(
            (msg) => msg.conversationId === conversationId
          );
          if (index !== -1) {
            const updatedMessages = [...prev];
            updatedMessages[index] = {
              ...updatedMessages[index],
              message: message.contenu,
              time: formatTime(message.dateEnvoi),
              unread:
                message.expediteurId._id !== user._id
                  ? (updatedMessages[index].unread || 0) + 1
                  : updatedMessages[index].unread || 0,
            };

            // Déplacer la conversation en haut de la liste
            const updatedMessage = updatedMessages.splice(index, 1)[0];
            return [updatedMessage, ...updatedMessages];
          } else {
            // Nouvelle conversation, recharger la liste
            setTimeout(() => loadConversations(), 500);
            return prev;
          }
        });
      };

      // Écouter les nouvelles réservations
      const handleNewReservation = (data) => {
      
        // Recharger les conversations pour inclure la nouvelle réservation
        setTimeout(() => loadConversations(), 500);
      };

      // Écouter les notifications de frappe
      const handleUserTyping = (data) => {
       
        // Vous pouvez implémenter l'affichage "en train de taper..." ici
      };

      const handleUserStoppedTyping = (data) => {
     
        // Masquer l'indicateur "en train de taper..."
      };

      // Ajouter les listeners
      socket.on("nouveauMessage", handleNewMessage);
      socket.on("nouvelleReservation", handleNewReservation);
      socket.on("userTyping", handleUserTyping);
      socket.on("userStoppedTyping", handleUserStoppedTyping);

      // Nettoyer les listeners lors du démontage
      return () => {
       
        socket.off("nouveauMessage", handleNewMessage);
        socket.off("nouvelleReservation", handleNewReservation);
        socket.off("userTyping", handleUserTyping);
        socket.off("userStoppedTyping", handleUserStoppedTyping);
      };
    }
  }, [socket, user]); // Supprimé loadConversations des dépendances

  // Fonction utilitaire pour vérifier si un ID est valide pour MongoDB
  const isValidObjectId = (id) => {
    return /^[0-9a-fA-F]{24}$/.test(id);
  };

  // Fonctions utilitaires
  const getOtherParticipant = (conversation) => {
    if (!conversation.participants || !user) return null;
    return conversation.participants.find((p) => p._id !== user._id);
  };

  const getOtherParticipantName = (conversation) => {
    const otherParticipant = getOtherParticipant(conversation);
    if (!otherParticipant) return "Utilisateur inconnu";
    return (
      otherParticipant.nom || otherParticipant.email || "Utilisateur inconnu"
    );
  };

  const getConversationType = (conversation) => {
    const otherParticipant = getOtherParticipant(conversation);
    if (!otherParticipant) return "Clients";

    if (conversation.type === "reservation_flash") return "Clients";
    return otherParticipant.userType === "tatoueur" ? "Tatoueurs" : "Clients";
  };

  const getInitials = (name) => {
    if (!name) return "??";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatTime = (dateString) => {
    if (!dateString) return "";

    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (diffDays === 1) {
      return "hier";
    } else if (diffDays < 7) {
      return `${diffDays}j`;
    } else {
      return date.toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
      });
    }
  };

  // Fonction pour charger toutes les conversations - DÉCLARÉE EN PREMIER
  const loadConversations = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await messagerieApi.getConversations();
      

      // Transformer les données API en format attendu par l'interface
      const formattedMessages =
        data?.map((conv) => ({
          initials: getInitials(getOtherParticipantName(conv)),
          name: getOtherParticipantName(conv),
          time: formatTime(conv.dernierMessage?.dateEnvoi),
          message: conv.dernierMessage?.contenu || "Nouvelle conversation",
          unread: conv.messagesNonLus || 0,
          type: getConversationType(conv),
          conversationId: conv._id,
          otherParticipant: getOtherParticipant(conv),
        })) || [];

      setMessages(formattedMessages);

      // Créer un objet conversations pour la gestion détaillée
      const conversationsObj = {};
      data?.forEach((conv) => {
        const otherParticipant = getOtherParticipant(conv);
        const conversationKey = conv._id;

        conversationsObj[conversationKey] = {
          contactInfo: {
            id: otherParticipant?._id,
            initials: getInitials(getOtherParticipantName(conv)),
            name: getOtherParticipantName(conv),
            status: "Hors ligne",
            userType: otherParticipant?.userType,
            avatar: otherParticipant?.photoProfil,
          },
          messages: [], 
          conversationData: conv,
        };
      });

      
      setConversations(conversationsObj);
    } catch (err) {
      console.error("❌ Erreur lors du chargement des conversations:", err);
      setError("Impossible de charger les conversations");
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour charger une conversation spécifique
  const loadConversation = async (conversationId) => {
    try {
      // Vérifier si l'ID est valide avant de faire la requête
      if (!isValidObjectId(conversationId)) {
        
        return;
      }

    
      const data = await messagerieApi.getConversation(conversationId);
      

      const otherParticipant = getOtherParticipant(data.conversation);

      setConversations((prev) => ({
        ...prev,
        [conversationId]: {
          contactInfo: {
            id: otherParticipant?._id,
            initials: getInitials(getOtherParticipantName(data.conversation)),
            name: getOtherParticipantName(data.conversation),
            status: "Hors ligne",
            userType: otherParticipant?.userType,
            avatar: otherParticipant?.photoProfil,
          },
          messages:
            data.messages?.map((msg) => ({
              id: msg._id,
              content: msg.contenu,
              time: formatTime(msg.dateEnvoi),
              sent:
                msg.expediteurId._id === user._id ||
                msg.expediteurId === user._id,
              edited: msg.edited || false,
            })) || [],
          conversationData: data.conversation,
        },
      }));

      
    } catch (err) {
      console.error("❌ Erreur lors du chargement de la conversation:", err);
      setError("Impossible de charger la conversation");
    }
  };

  const getFilteredMessages = () => {
    let filtered = messages;

    // Filtrer par type ou non lus
    if (activeTab !== "Tous") {
      filtered =
        activeTab === "Non lus"
          ? filtered.filter((msg) => msg.unread > 0)
          : filtered.filter((msg) => msg.type === activeTab);
    }

    // Filtrer par recherche
    if (searchTerm) {
      filtered = filtered.filter(
        (msg) =>
          msg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          msg.message.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  };

  // Fonction pour créer une nouvelle conversation
  const createNewConversation = async (conversationId, contactInfo) => {
  

    // Vérifier si la conversation existe déjà
    if (conversations[conversationId]) {
      
      return;
    }

    // Créer une nouvelle conversation localement
    const newConversation = {
      contactInfo: {
        id: contactInfo.id,
        initials: contactInfo.initials || "??",
        name: contactInfo.name || "Utilisateur inconnu",
        status: contactInfo.status || "Hors ligne",
        userType: contactInfo.userType,
        avatar: contactInfo.avatar,
      },
      messages: [],
      isNew: true, 
    };

    setConversations((prev) => ({
      ...prev,
      [conversationId]: newConversation,
    }));

    // Ajouter à la liste des messages si ce n'est pas déjà fait
    setMessages((prevMessages) => {
      const existingMessage = prevMessages.find(
        (msg) => msg.conversationId === conversationId
      );
      if (existingMessage) {
        return prevMessages;
      }

      const newMessageEntry = {
        initials: contactInfo.initials || "??",
        name: contactInfo.name || "Utilisateur inconnu",
        time: "à l'instant",
        message: "Nouvelle conversation",
        unread: 0,
        type: contactInfo.userType === "tatoueur" ? "Tatoueurs" : "Clients",
        conversationId: conversationId,
        otherParticipant: contactInfo,
      };

      return [newMessageEntry, ...prevMessages];
    });
  };

  // Fonction pour envoyer un message - CORRIGÉE
  const sendMessage = async (conversationId, content) => {
    if (!content.trim()) return;

    try {
      
      const conversation = conversations[conversationId];

      let response;
      let realConversationId = conversationId;

      // Si c'est une nouvelle conversation, créer la conversation sur le backend
      if (conversation?.isNew) {
       
        const messageData = {
          destinataireId: conversation.contactInfo.id,
          contenu: content,
        };

        response = await messagerieApi.sendMessage(messageData);
    

        // Récupérer le vrai ID de conversation depuis la réponse
        realConversationId = response.conversationId;
        

        // Supprimer l'ancienne conversation temporaire
        setConversations((prev) => {
          const newConv = { ...prev };
          delete newConv[conversationId]; // Supprimer la fausse conversation
          return newConv;
        });

        // Mettre à jour l'activeConversation avec le vrai ID
        setActiveConversation(realConversationId);

        // Recharger les conversations pour obtenir la vraie conversation avec les messages
        await loadConversations();

        // Charger la conversation spécifique pour avoir les messages
        await loadConversation(realConversationId);
      } else {
       
        // Conversation existante
        const messageData = {
          conversationId: conversationId,
          destinataireId: conversation?.contactInfo?.id,
          contenu: content,
        };

        response = await messagerieApi.sendMessage(messageData);
       

        // Ajouter le message localement IMMÉDIATEMENT pour une réponse rapide
        const newMsg = {
          id: response._id || Date.now().toString(),
          content: content,
          time: formatTime(new Date().toISOString()),
          sent: true,
        };

        

        setConversations((prev) => ({
          ...prev,
          [conversationId]: {
            ...prev[conversationId],
            messages: [...(prev[conversationId]?.messages || []), newMsg],
            isNew: false,
          },
        }));

        // Mettre à jour la liste des messages
        updateMessagesList(conversationId, content);
      }

      // Réinitialiser le champ de saisie
      setNewMessage("");
    } catch (err) {
      console.error("❌ Erreur lors de l'envoi du message:", err);
      setError("Impossible d'envoyer le message");
    }
  };

  // Fonction utilitaire pour mettre à jour la liste des messages
  const updateMessagesList = (conversationId, content) => {
   

    setMessages((prev) => {
      const index = prev.findIndex(
        (msg) => msg.conversationId === conversationId
      );
      if (index === -1) {
     
        return prev;
      }

      const updatedMessages = [...prev];
      updatedMessages[index] = {
        ...updatedMessages[index],
        message: content,
        time: "à l'instant",
      };

      // Déplacer le message en haut de la liste
      const updatedMessage = updatedMessages.splice(index, 1)[0];
      const newList = [updatedMessage, ...updatedMessages];

     
      return newList;
    });
  };

  // Fonction pour marquer une conversation comme lue
  const markAsRead = async (conversationId) => {
    try {
      // Vérifier si l'ID est valide avant de faire la requête
      if (!isValidObjectId(conversationId)) {
        
        return;
      }

      // Trouver le dernier message non lu
      const conversation = conversations[conversationId];
      if (!conversation) return;

      const unreadMessages = conversation.messages.filter(
        (msg) => !msg.sent && !msg.read
      );
      if (unreadMessages.length === 0) return;

      // Marquer comme lu sur le backend
      const lastUnreadMessage = unreadMessages[unreadMessages.length - 1];
      await messagerieApi.markAsRead(lastUnreadMessage.id);

      // Mettre à jour localement
      setMessages((prev) => {
        const index = prev.findIndex(
          (msg) => msg.conversationId === conversationId
        );
        if (index === -1) return prev;

        const updatedMessages = [...prev];
        updatedMessages[index] = {
          ...updatedMessages[index],
          unread: 0,
        };

        return updatedMessages;
      });
    } catch (err) {
      console.error("Erreur lors du marquage comme lu:", err);
    }
  };

  // Fonction pour supprimer un message
  const deleteMessage = async (conversationId, messageId) => {
    try {
     

      setConversations((prev) => {
        if (!prev[conversationId]) return prev;

        return {
          ...prev,
          [conversationId]: {
            ...prev[conversationId],
            messages: prev[conversationId].messages.filter(
              (msg) => msg.id !== messageId
            ),
          },
        };
      });
    } catch (err) {
      console.error("Erreur lors de la suppression du message:", err);
      setError("Impossible de supprimer le message");
    }
  };

  // Fonction pour modifier un message
  const editMessage = async (conversationId, messageId, newContent) => {
    try {
    

      setConversations((prev) => {
        if (!prev[conversationId]) return prev;

        return {
          ...prev,
          [conversationId]: {
            ...prev[conversationId],
            messages: prev[conversationId].messages.map((msg) =>
              msg.id === messageId
                ? { ...msg, content: newContent, edited: true }
                : msg
            ),
          },
        };
      });

      // Mettre à jour aussi le dernier message dans la liste si c'est le plus récent
      const conversationMessages =
        conversations[conversationId]?.messages || [];
      const lastMessage = conversationMessages[conversationMessages.length - 1];

      if (lastMessage && lastMessage.id === messageId) {
        updateMessagesList(conversationId, newContent);
      }
    } catch (err) {
      console.error("Erreur lors de la modification du message:", err);
      setError("Impossible de modifier le message");
    }
  };

  // Fonction pour créer une conversation de réservation
  const createReservationConversation = async (reservationData) => {
    try {
      const response = await messagerieApi.createReservationMessage(
        reservationData
      );

      // Recharger les conversations pour inclure la nouvelle
      await loadConversations();

      return response;
    } catch (err) {
      console.error(
        "Erreur lors de la création de la conversation de réservation:",
        err
      );
      setError("Impossible de créer la conversation de réservation");
      throw err;
    }
  };

  return (
    <MessagerieContext.Provider
      value={{
        // États
        activeTab,
        setActiveTab,
        tabs,
        messages,
        setMessages,
        searchTerm,
        setSearchTerm,
        conversations,
        newMessage,
        setNewMessage,
        activeConversation,
        setActiveConversation,
        loading,
        error,
        getFilteredMessages,
        sendMessage,
        markAsRead,
        deleteMessage,
        editMessage,
        createNewConversation,
        createReservationConversation,
        loadConversations,
        loadConversation,
      }}
    >
      {children}
    </MessagerieContext.Provider>
  );
}
