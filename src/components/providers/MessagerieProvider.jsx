import React, { useState } from "react";
import { MessagerieContext } from "../../context/MessagerieContext";

export default function MessagerieProvider({ children }) {
  // État pour les onglets
  const [activeTab, setActiveTab] = useState("Tous");
  const tabs = ["Tous", "Clients", "Tatoueurs", "Non lus"];

  // État pour les messages
  const [messages, setMessages] = useState([
    {
      initials: "JS",
      name: "Julie S.",
      time: "10:25",
      message: "Super, je voudrais réserver le flash de rose que vous avez posté.",
      unread: 2,
      type: "Clients",
    },
    {
      initials: "TA",
      name: "TattooArtist3",
      time: "hier",
      message: "Merci pour les conseils sur la coloration, ça m'a beaucoup aidé !",
      unread: 0,
      type: "Tatoueurs",
    },
    {
      initials: "LM",
      name: "Lucas M.",
      time: "hier",
      message: "Est-ce que le flash avec le serpent est toujours disponible ?",
      unread: 0,
      type: "Clients",
    },
    {
      initials: "CM",
      name: "Camille M.",
      time: "20/04",
      message: "Le tatouage est super, merci encore ! Je vous enverrai une photo quand...",
      unread: 0,
      type: "Clients",
    },
    {
      initials: "IN",
      name: "Inkediin Support",
      time: "18/04",
      message: "Bonjour, nous avons bien reçu votre demande concernant le paiement...",
      unread: 0,
      type: "Tatoueurs",
    },
  ]);

  // État pour les recherches
  const [searchTerm, setSearchTerm] = useState("");

  // État pour les conversations individuelles
  const [conversations, setConversations] = useState({
    "JS": {
      contactInfo: {
        initials: "JS",
        name: "Julie S.",
        status: "En ligne"
      },
      messages: [
        {
          content: "Bonjour ! J'ai vu votre flash de rose old school et je suis intéressée.",
          time: "09:42",
          sent: false
        },
        {
          content: "Bonjour Julie ! Merci pour votre intérêt. La rose est toujours disponible.",
          time: "09:45",
          sent: true
        },
        {
          content: "Super ! J'aimerais la réserver pour le mois prochain si possible.",
          time: "09:48",
          sent: false
        },
        {
          content: "Bien sûr, voici le design dont nous parlons :",
          time: "09:50",
          sent: true
        },
        {
          isProduct: true,
          title: "Rose Old School",
          price: "150 €",
          sent: true
        },
        {
          content: "J'ai des disponibilités les 15, 16 et 20 mai. Est-ce qu'une de ces dates vous conviendrait ?",
          time: "09:51",
          sent: true
        },
        {
          content: "Le 16 mai serait parfait pour moi. Comment procède-t-on pour la réservation ?",
          time: "10:15",
          sent: false
        },
        {
          content: "Et est-ce qu'il y a un acompte à verser ?",
          time: "10:15",
          sent: false
        },
        {
          content: "Parfait ! Je vais bloquer le 16 mai pour vous. Oui, il y a un acompte de 50€ pour confirmer la réservation. Vous pouvez le régler directement via l'application en cliquant sur le bouton de réservation du flash.",
          time: "10:20",
          sent: true
        }
      ]
    }
    // Vous pourriez ajouter d'autres conversations ici
  });

  // État pour le message actuellement en cours de rédaction
  const [newMessage, setNewMessage] = useState("");
  
  // État pour la conversation active
  const [activeConversation, setActiveConversation] = useState(null);

  // Fonctions utilitaires
  const getFilteredMessages = () => {
    let filtered = messages;
    
    // Filtrer par type ou non lus
    if (activeTab !== "Tous") {
      filtered = activeTab === "Non lus" 
        ? filtered.filter(msg => msg.unread > 0)
        : filtered.filter(msg => msg.type === activeTab);
    }
    
    // Filtrer par recherche
    if (searchTerm) {
      filtered = filtered.filter(
        msg => msg.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
               msg.message.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filtered;
  };

  // Fonction pour envoyer un message
  const sendMessage = (contactInitials, content) => {
    if (!content.trim()) return;
    
    const newMsg = {
      content,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      sent: true
    };
    
    setConversations(prev => {
      if (!prev[contactInitials]) {
        // Créer une nouvelle conversation si elle n'existe pas
        return {
          ...prev,
          [contactInitials]: {
            contactInfo: {
              // Il faudrait idéalement rechercher les infos du contact
              initials: contactInitials,
              name: "Nouveau contact",
              status: "Hors ligne"
            },
            messages: [newMsg]
          }
        };
      }
      
      // Ajouter le message à une conversation existante
      return {
        ...prev,
        [contactInitials]: {
          ...prev[contactInitials],
          messages: [...prev[contactInitials].messages, newMsg]
        }
      };
    });
    
    // Mettre à jour l'aperçu du message dans la liste des messages
    setMessages(prev => {
      const index = prev.findIndex(msg => msg.initials === contactInitials);
      if (index === -1) return prev;
      
      const updatedMessages = [...prev];
      updatedMessages[index] = {
        ...updatedMessages[index],
        message: content,
        time: "à l'instant"
      };
      
      return updatedMessages;
    });
    
    // Réinitialiser le champ de saisie
    setNewMessage("");
  };

  // Fonction pour marquer une conversation comme lue
  const markAsRead = (contactInitials) => {
    setMessages(prev => {
      const index = prev.findIndex(msg => msg.initials === contactInitials);
      if (index === -1) return prev;
      
      const updatedMessages = [...prev];
      updatedMessages[index] = {
        ...updatedMessages[index],
        unread: 0
      };
      
      return updatedMessages;
    });
  };

  return (
    <MessagerieContext.Provider 
      value={{
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
        getFilteredMessages,
        sendMessage,
        markAsRead
      }}
    >
      {children}
    </MessagerieContext.Provider>
  );
}