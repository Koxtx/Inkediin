import React, { useContext, useState } from "react";
import {
  MessageSquare,
  Calendar,
  Heart,
  Bell,
  Tag,
  AlertCircle,
  MoreVertical,
  User,
  MapPin,
  RefreshCw,
  Check,
  Trash2,
  Archive,
  Star,
  Eye,
  EyeOff,
} from "lucide-react";
import { NotifContext } from "../../../context/NotifContext";

const NotificationDropdown = ({ notification, onClose }) => {
  const {
    markAsRead,
    deleteNotification,
    archiveNotification,
    starNotification,
  } = useContext(NotifContext);

  const handleAction = (action, e) => {
    e.stopPropagation();
    switch (action) {
      case "toggleRead":
        markAsRead(notification.id, notification.read);
        break;
      case "star":
        starNotification(notification.id);
        break;
      case "archive":
        archiveNotification(notification.id);
        break;
      case "delete":
        deleteNotification(notification.id);
        break;
    }
    onClose();
  };

  return (
    <div className="absolute right-2 top-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10 min-w-48">
      <div className="py-1">
        <button
          onClick={(e) => handleAction("toggleRead", e)}
          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          {notification.read ? (
            <>
              <EyeOff size={16} className="mr-3" />
              Marquer comme non lu
            </>
          ) : (
            <>
              <Eye size={16} className="mr-3" />
              Marquer comme lu
            </>
          )}
        </button>

        <button
          onClick={(e) => handleAction("star", e)}
          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <Star
            size={16}
            className={`mr-3 ${
              notification.starred ? "text-yellow-500 fill-current" : ""
            }`}
          />
          {notification.starred ? "Retirer des favoris" : "Ajouter aux favoris"}
        </button>

        <button
          onClick={(e) => handleAction("archive", e)}
          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <Archive size={16} className="mr-3" />
          {notification.archived ? "Désarchiver" : "Archiver"}
        </button>

        <hr className="my-1 border-gray-200 dark:border-gray-700" />

        <button
          onClick={(e) => handleAction("delete", e)}
          className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
        >
          <Trash2 size={16} className="mr-3" />
          Supprimer
        </button>
      </div>
    </div>
  );
};

export const NotificationList = () => {
  const [activeTab, setActiveTab] = useState("Toutes");
  const [openDropdown, setOpenDropdown] = useState(null);
  const {
    notifications,
    markAsRead,
    markAllAsRead,
    getUnreadCount,
    getStarredCount,
    getArchivedCount,
  } = useContext(NotifContext);

  const tabs = [
    "Toutes",
    "Messages",
    "Promotions",
    "Mentions J'aime",
    "Système",
  ];

  // Mapping des types de notifications avec leurs icônes
  const notificationIcons = {
    message: <MessageSquare className="text-blue-500" size={20} />,
    like: <Heart className="text-red-500" size={20} />,
    promo: <Tag className="text-purple-500" size={20} />,
    comment: <MessageSquare className="text-orange-500" size={20} />,
    newArtist: <User className="text-indigo-500" size={20} />,
    system: <AlertCircle className="text-gray-500" size={20} />,
  };

  // Filtrage des notifications en fonction de l'onglet actif
  const filteredNotifications =
    activeTab === "Toutes"
      ? notifications.filter((notif) => !notif.archived)
      : activeTab === "Messages"
      ? notifications.filter(
          (notif) =>
            (notif.type === "message" || notif.type === "comment") &&
            !notif.archived
        )
      : activeTab === "Promotions"
      ? notifications.filter(
          (notif) => notif.type === "promo" && !notif.archived
        )
      : activeTab === "Mentions J'aime"
      ? notifications.filter(
          (notif) => notif.type === "like" && !notif.archived
        )
      : notifications.filter(
          (notif) =>
            (notif.type === "system" || notif.type === "newArtist") &&
            !notif.archived
        );

  // Regroupement des notifications par date
  const groupedNotifications = filteredNotifications.reduce(
    (groups, notification) => {
      const date = notification.date;
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(notification);
      return groups;
    },
    {}
  );

  const unreadCount = getUnreadCount();

  // Fermer le dropdown quand on clique ailleurs
  React.useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(".dropdown-container")) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8">
      <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-5">
        Notifications
      </h2>

      {/* En-tête avec compteur et bouton "tout marquer comme lu" */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <span className="font-medium">
            Toutes les notifications
            {unreadCount > 0 && (
              <span className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {unreadCount}
              </span>
            )}
          </span>

          {/* Compteurs additionnels */}
          <div className="hidden sm:flex items-center space-x-3 text-sm text-gray-500">
            {getStarredCount() > 0 && (
              <span className="flex items-center">
                <Star size={14} className="mr-1 text-yellow-500" />
                {getStarredCount()}
              </span>
            )}
            {getArchivedCount() > 0 && (
              <span className="flex items-center">
                <Archive size={14} className="mr-1 text-gray-400" />
                {getArchivedCount()}
              </span>
            )}
          </div>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="text-sm text-red-500 hover:text-red-600 flex items-center"
          >
            <Check size={16} className="mr-1" />
            Tout marquer comme lu
          </button>
        )}
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

      {/* Liste des notifications */}
      <div className="space-y-6">
        {Object.keys(groupedNotifications).length > 0 ? (
          Object.entries(groupedNotifications).map(([date, notifications]) => (
            <div key={date} className="space-y-4">
              {/* Date header */}
              <div className="text-center mb-4">
                <span className="inline-block px-3 py-1 text-xs bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full">
                  {date}
                </span>
              </div>

              {/* Notifications for this date */}
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-all duration-200
                    ${!notification.read ? "border-l-4 border-red-500" : ""}
                    ${notification.starred ? "ring-2 ring-yellow-300" : ""}`}
                >
                  <div className="p-4 sm:p-5 flex">
                    {/* Icon */}
                    <div className="flex-shrink-0 mr-4 bg-gray-100 dark:bg-gray-700 rounded-full p-2 relative">
                      {notificationIcons[notification.type]}
                      {notification.starred && (
                        <Star
                          size={12}
                          className="absolute -top-1 -right-1 text-yellow-500 fill-current"
                        />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-grow pr-4">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                        {notification.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 text-sm mb-2">
                        {notification.content}
                      </p>
                      <p className="text-gray-500 text-xs mb-3">
                        {notification.time}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {notification.actions.map((action, idx) => (
                          <button
                            key={idx}
                            className={`text-sm px-3 py-1 rounded-full focus:outline-none focus:ring-2 focus:ring-red-300
                              ${
                                action.primary
                                  ? "bg-red-500 hover:bg-red-600 text-white"
                                  : "bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300"
                              }`}
                            onClick={() => {
                              if (!action.primary) {
                                markAsRead(notification.id, notification.read);
                              }
                            }}
                          >
                            {action.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* More options dropdown */}
                    <div className="flex-shrink-0 self-start relative dropdown-container">
                      <button
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors duration-200"
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenDropdown(
                            openDropdown === notification.id
                              ? null
                              : notification.id
                          );
                        }}
                      >
                        <MoreVertical size={20} className="text-gray-500" />
                      </button>

                      {openDropdown === notification.id && (
                        <NotificationDropdown
                          notification={notification}
                          onClose={() => setOpenDropdown(null)}
                        />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))
        ) : (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <Bell size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              Aucune notification dans cette catégorie
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
