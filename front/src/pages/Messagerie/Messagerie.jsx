import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { Loader2, RefreshCw, AlertCircle } from "lucide-react";
import { MessagerieContext } from "../../context/MessagerieContext";

export default function Messagerie() {
  const {
    activeTab,
    setActiveTab,
    tabs,
    searchTerm,
    setSearchTerm,
    getFilteredMessages,
    setActiveConversation,
    markAsRead,
    loading,
    error,
    loadConversations,
  } = useContext(MessagerieContext);

  const filteredMessages = getFilteredMessages();

  const handleConversationClick = (msg) => {
    setActiveConversation(msg.conversationId);
    markAsRead(msg.conversationId);
  };

  const handleRefresh = () => {
    loadConversations();
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold">
          Messagerie
        </h2>

        {/* Bouton de rechargement */}
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="p-2 text-gray-600 hover:text-red-500 transition-colors disabled:opacity-50"
          title="Actualiser les conversations"
        >
          <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Affichage des erreurs */}
      {error && (
        <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
          <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
          <span className="text-red-700">{error}</span>
          <button
            onClick={handleRefresh}
            className="ml-auto px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
          >
            Réessayer
          </button>
        </div>
      )}

      {/* Barre de recherche */}
      <div className="relative mb-5">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <span className="text-gray-500">🔍</span>
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-red-300 transition-colors dark:bg-gray-700 dark:text-white"
          placeholder="Rechercher dans les messages..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Tabs - version mobile (dropdown) */}
      <div className="block sm:hidden mb-5">
        <select
          className="w-full bg-red-400 text-white px-4 py-2 rounded-lg"
          value={activeTab}
          onChange={(e) => setActiveTab(e.target.value)}
        >
          {tabs.map((tab) => (
            <option key={tab} value={tab}>
              {tab}
            </option>
          ))}
        </select>
      </div>

      {/* Tabs - version tablette/desktop */}
      <div className="hidden sm:flex overflow-x-auto gap-2 md:gap-3 mb-5 pb-2">
        {tabs.map((tab) => (
          <button
            key={tab}
            className={`${
              activeTab === tab ? "bg-red-500" : "bg-red-400 hover:bg-red-500"
            } transition-colors text-white text-sm md:text-base px-4 md:px-5 py-2 rounded-full whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-red-300`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* État de chargement */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-red-500" />
          <span className="ml-2 text-gray-600 dark:text-gray-400">
            Chargement des conversations...
          </span>
        </div>
      )}

      {/* Liste des messages */}
      {!loading && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden divide-y divide-gray-200 dark:divide-gray-700">
          {filteredMessages.length > 0 ? (
            filteredMessages.map((msg, index) => (
              <Link
                to={`/conversation/${msg.conversationId}`}
                key={msg.conversationId || index}
                className="flex items-center p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                onClick={() => handleConversationClick(msg)}
              >
                {/* Avatar avec initiales ou photo */}
                <div className="w-10 h-10 flex-shrink-0 rounded-full bg-red-400 text-white flex items-center justify-center font-medium overflow-hidden">
                  {msg.otherParticipant?.avatar ? (
                    <img
                      src={msg.otherParticipant.avatar}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    msg.initials
                  )}
                </div>

                {/* Contenu du message */}
                <div className="ml-3 flex-grow overflow-hidden">
                  <div className="flex justify-between items-start mb-1">
                    <div className="flex items-center">
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {msg.name}
                      </span>
                      {msg.otherParticipant?.userType && (
                        <span className="ml-2 px-2 py-1 text-xs bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300 rounded-full capitalize">
                          {msg.otherParticipant.userType}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-500 flex-shrink-0">
                      {msg.time}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 truncate">
                    {msg.message}
                  </p>
                </div>

                {/* Indicateur de messages non lus */}
                {msg.unread > 0 && (
                  <div className="ml-2 flex items-center flex-shrink-0">
                    <span className="text-red-500 mr-1">●</span>
                    <div className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {msg.unread}
                    </div>
                  </div>
                )}
              </Link>
            ))
          ) : (
            <div className="text-center py-12">
              {searchTerm ? (
                <div>
                  <p className="text-gray-500 dark:text-gray-400 mb-2">
                    Aucun résultat pour "{searchTerm}"
                  </p>
                  <button
                    onClick={() => setSearchTerm("")}
                    className="text-red-500 hover:text-red-600 text-sm"
                  >
                    Effacer la recherche
                  </button>
                </div>
              ) : activeTab === "Non lus" ? (
                <div>
                  <p className="text-gray-500 dark:text-gray-400 mb-2">
                    Aucun message non lu
                  </p>
                  <p className="text-sm text-gray-400 dark:text-gray-500">
                    Tous vos messages ont été lus
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-gray-500 dark:text-gray-400 mb-2">
                    Aucune conversation dans cette catégorie
                  </p>
                  <p className="text-sm text-gray-400 dark:text-gray-500">
                    Commencez à échanger avec d'autres utilisateurs
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Message d'aide pour les nouvelles conversations */}
      {!loading &&
        filteredMessages.length === 0 &&
        !searchTerm &&
        activeTab === "Tous" && (
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <h3 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
              Comment commencer une conversation ?
            </h3>
            <ul className="text-sm text-blue-600 dark:text-blue-300 space-y-1">
              <li>
                • Visitez le profil d'un utilisateur et cliquez sur "Message"
              </li>
              <li>• Réservez un flash tattoo pour démarrer une conversation</li>
              <li>• Répondez aux messages que vous recevez</li>
            </ul>
          </div>
        )}
    </div>
  );
}
