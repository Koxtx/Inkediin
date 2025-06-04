import React, { useContext } from "react";
import { Link } from "react-router-dom";
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
  } = useContext(MessagerieContext);

  const filteredMessages = getFilteredMessages();

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8">
      <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-5">
        Messagerie
      </h2>

      {/* Barre de recherche */}
      <div className="relative mb-5">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <span className="text-gray-500">🔍</span>
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-red-300 transition-colors"
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

      {/* Liste des messages */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden divide-y divide-gray-200 dark:divide-gray-700">
        {filteredMessages.map((msg, index) => (
          <Link
            to={`/conversation`}
            key={index}
            className="flex items-center p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            onClick={() => {
              setActiveConversation(msg.initials);
              markAsRead(msg.initials);
            }}
          >
            {/* Avatar avec initiales */}
            <div className="w-10 h-10 flex-shrink-0 rounded-full bg-red-400 text-white flex items-center justify-center font-medium">
              {msg.initials}
            </div>

            {/* Contenu du message */}
            <div className="ml-3 flex-grow overflow-hidden">
              <div className="flex justify-between mb-1">
                <span className="font-semibold text-gray-900 dark:text-white">
                  {msg.name}
                </span>
                <span className="text-xs text-gray-500">{msg.time}</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 truncate">
                {msg.message}
              </p>
            </div>

            {/* Indicateur de messages non lus */}
            {msg.unread > 0 && (
              <div className="ml-2 flex items-center">
                <span className="text-red-500 mr-1">●</span>
                <div className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {msg.unread}
                </div>
              </div>
            )}
          </Link>
        ))}

        {/* Message si aucun message trouvé */}
        {filteredMessages.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Aucun message dans cette catégorie
          </div>
        )}
      </div>
    </div>
  );
}
