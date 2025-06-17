import React, { useContext, useEffect, useState, useRef } from "react";
import { Link, useParams, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  MoreVertical,
  Plus,
  Send,
  Smile,
  Edit3,
  Trash2,
  Image,
  Paperclip,
  Camera,
} from "lucide-react";
import { MessagerieContext } from "../../../context/MessagerieContext";
import { SocketContext } from "../../../context/SocketContext";

export default function Conversation() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { socket } = useContext(SocketContext);
  const messageEndRef = useRef(null); // Ref pour le scroll automatique

  const {
    conversations,
    newMessage,
    setNewMessage,
    activeConversation,
    setActiveConversation,
    sendMessage,
    markAsRead,
    deleteMessage,
    editMessage,
    createNewConversation,
    loadConversation,
    loading,
    error,
  } = useContext(MessagerieContext);

  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editingContent, setEditingContent] = useState("");
  const [messageMenuId, setMessageMenuId] = useState(null);
  const [contactInfo, setContactInfo] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState(null);

  // Fonction utilitaire pour vérifier si un ID est valide pour MongoDB
  const isValidObjectId = (id) => {
    return /^[0-9a-fA-F]{24}$/.test(id);
  };

  // Fonction pour déterminer les informations de contact à afficher
  const getDisplayContactInfo = () => {
    if (contactInfo) {
      return contactInfo;
    }

    if (conversations[activeConversation]?.contactInfo) {
      return conversations[activeConversation].contactInfo;
    }

    // Valeurs par défaut si aucune info n'est disponible
    return {
      initials: id?.substring(0, 2).toUpperCase() || "??",
      name: "Utilisateur inconnu",
      status: "Hors ligne",
    };
  };

  // Variables calculées
  const displayContactInfo = getDisplayContactInfo();
  const messages = conversations[activeConversation]?.messages || [];

  console.log(
    "💬 Messages affichés:",
    messages.length,
    "pour conversation active:",
    activeConversation
  );

  // useEffect principal pour la gestion de la conversation
  useEffect(() => {
    console.log(
      "🔄 Conversation useEffect - ID:",
      id,
      "ActiveConversation:",
      activeConversation
    );

    if (id && id !== activeConversation) {
      setActiveConversation(id);

      // Seulement marquer comme lu si l'ID est valide
      if (isValidObjectId(id)) {
        markAsRead(id);

        // Charger la conversation si elle n'existe pas en local
        if (!conversations[id]) {
          console.log("📥 Chargement conversation depuis serveur");
          loadConversation(id);
        }
      }
    }

    // Vérifier si on a des informations de contact depuis la navigation pour une NOUVELLE conversation
    if (
      location.state?.contactInfo &&
      !isValidObjectId(id) &&
      !conversations[id]
    ) {
      const newContactInfo = location.state.contactInfo;
      console.log(
        "👤 Création nouvelle conversation avec infos contact:",
        newContactInfo
      );
      setContactInfo(newContactInfo);
      createNewConversation(id, newContactInfo);
    }
  }, [
    id,
    activeConversation,
    setActiveConversation,
    markAsRead,
    location.state,
    conversations,
    createNewConversation,
    loadConversation,
  ]);

  // Effet pour la redirection
  useEffect(() => {
    if (
      activeConversation &&
      activeConversation !== id &&
      isValidObjectId(activeConversation) &&
      !isValidObjectId(id)
    ) {
      console.log(
        "🔀 Redirection vers nouvelle conversation:",
        activeConversation
      );
      navigate(`/conversation/${activeConversation}`, { replace: true });
    }
  }, [activeConversation, id, navigate]);

  // Gestion des événements de frappe via WebSocket
  useEffect(() => {
    if (socket && activeConversation && isValidObjectId(activeConversation)) {
      const handleUserTyping = (data) => {
        if (data.userId !== socket.userId) {
          setOtherUserTyping(true);
          setTimeout(() => setOtherUserTyping(false), 3000);
        }
      };

      const handleUserStoppedTyping = (data) => {
        if (data.userId !== socket.userId) {
          setOtherUserTyping(false);
        }
      };

      socket.on("userTyping", handleUserTyping);
      socket.on("userStoppedTyping", handleUserStoppedTyping);

      return () => {
        socket.off("userTyping", handleUserTyping);
        socket.off("userStoppedTyping", handleUserStoppedTyping);
      };
    }
  }, [socket, activeConversation]);

  // Effet pour charger les messages de la conversation active
  useEffect(() => {
    if (
      activeConversation &&
      isValidObjectId(activeConversation) &&
      conversations[activeConversation] &&
      (!conversations[activeConversation].messages ||
        conversations[activeConversation].messages.length === 0)
    ) {
      console.log(
        "📥 Chargement messages pour conversation active:",
        activeConversation
      );
      loadConversation(activeConversation);
    }
  }, [activeConversation, conversations, loadConversation]);

  // Effet pour le scroll automatique vers le bas quand les messages changent
  useEffect(() => {
    if (messageEndRef.current && messages) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Si pas de conversation active, afficher un message d'erreur
  if (!activeConversation) {
    return (
      <div className="flex flex-col h-screen items-center justify-center bg-gray-100 dark:bg-gray-900">
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Conversation non trouvée
        </p>
        <Link
          to="/messagerie"
          className="px-4 py-2 bg-red-400 text-white rounded-lg hover:bg-red-500 transition-colors flex items-center gap-2"
        >
          <ArrowLeft size={16} />
          Retour à la messagerie
        </Link>
      </div>
    );
  }

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      console.log(
        "📤 Envoi message depuis composant:",
        activeConversation,
        newMessage
      );

      // Arrêter l'indicateur de frappe
      if (socket && isTyping) {
        socket.emit("stopTyping", {
          conversationId: activeConversation,
          userId: socket.userId,
        });
        setIsTyping(false);
      }

      sendMessage(activeConversation, newMessage);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Gestion de la frappe en temps réel
  const handleInputChange = (e) => {
    const value = e.target.value;
    setNewMessage(value);

    if (socket && activeConversation && isValidObjectId(activeConversation)) {
      if (value.trim() && !isTyping) {
        socket.emit("typing", {
          conversationId: activeConversation,
          userId: socket.userId,
        });
        setIsTyping(true);
      }

      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }

      const timeout = setTimeout(() => {
        if (socket && isTyping) {
          socket.emit("stopTyping", {
            conversationId: activeConversation,
            userId: socket.userId,
          });
          setIsTyping(false);
        }
      }, 2000);

      setTypingTimeout(timeout);

      if (!value.trim() && isTyping) {
        socket.emit("stopTyping", {
          conversationId: activeConversation,
          userId: socket.userId,
        });
        setIsTyping(false);
      }
    }
  };

  const handleEditMessage = (messageId, content) => {
    setEditingMessageId(messageId);
    setEditingContent(content);
    setMessageMenuId(null);
  };

  const handleSaveEdit = (messageId) => {
    if (editingContent.trim()) {
      editMessage(activeConversation, messageId, editingContent);
    }
    setEditingMessageId(null);
    setEditingContent("");
  };

  const handleDeleteMessage = (messageId) => {
    deleteMessage(activeConversation, messageId);
    setMessageMenuId(null);
  };

  const handleAttachmentAction = (type) => {
    console.log(`Action d'attachement: ${type}`);
    setShowAttachmentMenu(false);
  };

  const handleViewProfile = () => {
    if (contactInfo?.id) {
      navigate(`/profil/${contactInfo.id}`);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-md px-4 py-3 flex items-center relative">
        <Link
          to="/messagerie"
          className="text-gray-600 dark:text-gray-300 hover:text-red-500 dark:hover:text-red-400 mr-4"
        >
          <ArrowLeft size={20} />
        </Link>

        <button
          onClick={handleViewProfile}
          className="flex items-center flex-grow hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg p-2 transition-colors"
        >
          {displayContactInfo.avatar ? (
            <img
              src={displayContactInfo.avatar}
              alt="Avatar"
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-red-400 text-white flex items-center justify-center font-medium">
              {displayContactInfo.initials}
            </div>
          )}
          <div className="ml-3 flex-grow text-left">
            <div className="font-semibold text-gray-900 dark:text-white">
              {displayContactInfo.name}
            </div>
            <div className="text-xs text-green-500">
              {displayContactInfo.status}
            </div>
            {displayContactInfo.userType && (
              <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                {displayContactInfo.userType}
              </div>
            )}
          </div>
        </button>

        <div className="relative">
          <button
            className="text-gray-600 dark:text-gray-300 hover:text-red-500 dark:hover:text-red-400 cursor-pointer p-1"
            onClick={() => setShowOptionsMenu(!showOptionsMenu)}
          >
            <MoreVertical size={20} />
          </button>

          {showOptionsMenu && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 z-10">
              <div className="py-2">
                <button
                  onClick={handleViewProfile}
                  className="w-full px-4 py-2 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                >
                  <Edit3 size={16} />
                  Voir le profil
                </button>
                <button className="w-full px-4 py-2 text-left text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2">
                  <Trash2 size={16} />
                  Supprimer la conversation
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Messages container */}
      <div className="flex-grow overflow-y-auto px-4 py-6">
        {loading ? (
          <div className="text-center text-gray-500 dark:text-gray-400 mt-20">
            <p>Chargement des messages...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 mt-20">
            <p className="mb-2">Aucun message pour le moment</p>
            <p className="text-sm">
              Commencez la conversation en envoyant un message !
            </p>
          </div>
        ) : (
          <>
            <div className="text-center mb-6">
              <span className="inline-block px-3 py-1 text-xs bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full">
                Aujourd'hui
              </span>
            </div>

            {messages.map((message, index) => (
              <div key={message.id || index} className="relative group">
                {message.isProduct ? (
                  <div
                    className={`flex justify-${
                      message.sent ? "end" : "start"
                    } mb-4`}
                  >
                    <div className="max-w-xs sm:max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                      <div className="h-40 bg-gray-300 dark:bg-gray-700 flex items-center justify-center">
                        <Image
                          size={24}
                          className="text-gray-500 dark:text-gray-400"
                        />
                      </div>
                      <div className="p-3 flex justify-between items-center">
                        <div className="text-gray-900 dark:text-white font-medium">
                          {message.title}
                        </div>
                        <div className="text-red-500 font-bold">
                          {message.price}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    className={`flex ${
                      message.sent ? "justify-end" : "justify-start"
                    } mb-4 relative`}
                  >
                    <div className="relative max-w-xs sm:max-w-md">
                      {editingMessageId === (message.id || index) ? (
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-2 border-2 border-red-400">
                          <textarea
                            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded resize-none dark:bg-gray-700 dark:text-white"
                            value={editingContent}
                            onChange={(e) => setEditingContent(e.target.value)}
                            rows="2"
                          />
                          <div className="flex justify-end gap-2 mt-2">
                            <button
                              className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded"
                              onClick={() => setEditingMessageId(null)}
                            >
                              Annuler
                            </button>
                            <button
                              className="px-3 py-1 text-sm bg-red-400 text-white rounded"
                              onClick={() =>
                                handleSaveEdit(message.id || index)
                              }
                            >
                              Sauvegarder
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div
                            className={`px-4 py-2 rounded-lg ${
                              message.sent
                                ? "bg-red-400 text-white"
                                : "bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            }`}
                          >
                            {message.content}
                          </div>
                          <span
                            className={`text-xs text-gray-500 ${
                              message.sent ? "text-right" : "text-left"
                            } block mt-1`}
                          >
                            {message.time}
                          </span>

                          {message.sent && (
                            <div className="absolute -right-8 top-0 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                onClick={() =>
                                  setMessageMenuId(
                                    messageMenuId === (message.id || index)
                                      ? null
                                      : message.id || index
                                  )
                                }
                              >
                                <MoreVertical size={16} />
                              </button>

                              {messageMenuId === (message.id || index) && (
                                <div className="absolute right-0 top-full mt-1 w-32 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 z-10">
                                  <div className="py-1">
                                    <button
                                      className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                                      onClick={() =>
                                        handleEditMessage(
                                          message.id || index,
                                          message.content
                                        )
                                      }
                                    >
                                      <Edit3 size={12} />
                                      Modifier
                                    </button>
                                    <button
                                      className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                                      onClick={() =>
                                        handleDeleteMessage(message.id || index)
                                      }
                                    >
                                      <Trash2 size={12} />
                                      Supprimer
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Indicateur de frappe */}
            {otherUserTyping && (
              <div className="flex justify-start mb-4">
                <div className="bg-gray-200 dark:bg-gray-700 rounded-lg px-4 py-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-500 mt-1 block">
                    {displayContactInfo.name} est en train de taper...
                  </span>
                </div>
              </div>
            )}

            {/* Référence pour le scroll automatique */}
            <div ref={messageEndRef} />
          </>
        )}
      </div>

      {/* Input area */}
      <div className="bg-white dark:bg-gray-800 px-4 py-3 shadow-inner flex items-center relative">
        <div className="relative">
          <button
            className="text-gray-600 dark:text-gray-300 hover:text-red-500 dark:hover:text-red-400 mr-3 p-1"
            onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
          >
            <Plus size={20} />
          </button>

          {showAttachmentMenu && (
            <div className="absolute bottom-full left-0 mb-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 z-10">
              <div className="py-2">
                <button
                  className="w-full px-4 py-2 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                  onClick={() => handleAttachmentAction("photo")}
                >
                  <Camera size={16} />
                  Photo
                </button>
                <button
                  className="w-full px-4 py-2 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                  onClick={() => handleAttachmentAction("file")}
                >
                  <Paperclip size={16} />
                  Fichier
                </button>
                <button
                  className="w-full px-4 py-2 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                  onClick={() => handleAttachmentAction("image")}
                >
                  <Image size={16} />
                  Image
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="flex-grow relative">
          <textarea
            className="w-full border border-gray-300 dark:border-gray-600 rounded-full py-2 pl-4 pr-10 focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-red-300 transition-colors resize-none dark:bg-gray-700 dark:text-white"
            placeholder="Écrivez un message..."
            rows="1"
            value={newMessage}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
          />
          <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-red-500">
            <Smile size={16} />
          </button>
        </div>
        <button
          className="ml-3 text-gray-600 dark:text-gray-300 hover:text-red-500 dark:hover:text-red-400 p-1"
          onClick={handleSendMessage}
        >
          <Send size={20} />
        </button>
      </div>

      {/* Overlay pour fermer les menus */}
      {(showOptionsMenu || showAttachmentMenu || messageMenuId) && (
        <div
          className="fixed inset-0 z-5"
          onClick={() => {
            setShowOptionsMenu(false);
            setShowAttachmentMenu(false);
            setMessageMenuId(null);
          }}
        />
      )}
    </div>
  );
}
