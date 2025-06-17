import { createContext } from "react";

export const MessagerieContext = createContext({
  // États
  activeTab: "Tous",
  setActiveTab: () => {},
  tabs: [],
  messages: [],
  setMessages: () => {},
  searchTerm: "",
  setSearchTerm: () => {},
  conversations: {},
  newMessage: "",
  setNewMessage: () => {},
  activeConversation: null,
  setActiveConversation: () => {},
  loading: false,
  error: null,

  // Fonctions
  getFilteredMessages: () => [],
  sendMessage: () => {},
  markAsRead: () => {},
  deleteMessage: () => {},
  editMessage: () => {},
  createNewConversation: () => {},
  createReservationConversation: () => {},
  loadConversations: () => {},
  loadConversation: () => {},
});
