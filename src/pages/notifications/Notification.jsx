import React, { useState } from "react";
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
} from "lucide-react";

export default function Notification() {
  const [activeTab, setActiveTab] = useState("Toutes");

  const tabs = [
    "Toutes",
    "Messages",
    "Rendez-vous",
    "Promotions",
    "Mentions J'aime",
    "Système",
  ];

  // Mapping des types de notifications avec leurs icônes
  const notificationIcons = {
    message: <MessageSquare className="text-blue-500" size={20} />,
    appointment: <Calendar className="text-green-500" size={20} />,
    like: <Heart className="text-red-500" size={20} />,
    promo: <Tag className="text-purple-500" size={20} />,
    comment: <MessageSquare className="text-orange-500" size={20} />,
    newArtist: <User className="text-indigo-500" size={20} />,
    system: <AlertCircle className="text-gray-500" size={20} />,
  };

  const notifications = [
    {
      id: 1,
      type: "message",
      title: "Nouveau message de TattooArtist1",
      content:
        "Bonjour, j'ai reçu votre demande de rendez-vous. Pouvons-nous discuter de votre projet de tatouage?",
      time: "Il y a 30 minutes",
      date: "Aujourd'hui",
      read: false,
      actions: [
        { label: "Répondre", primary: true },
        { label: "Marquer comme lu", primary: false },
      ],
    },
    {
      id: 2,
      type: "appointment",
      title: "Rappel de rendez-vous",
      content:
        "Votre rendez-vous avec TattooArtist2 est confirmé pour demain à 14h00.",
      time: "Il y a 2 heures",
      date: "Aujourd'hui",
      read: false,
      actions: [
        { label: "Voir détails", primary: true },
        { label: "Marquer comme lu", primary: false },
      ],
    },
    {
      id: 3,
      type: "like",
      title: "TattooArtist4 aime votre design",
      content:
        "TattooArtist4 a aimé le design que vous avez partagé dans la galerie.",
      time: "Il y a 5 heures",
      date: "Aujourd'hui",
      read: true,
      actions: [
        { label: "Voir profil", primary: true },
        { label: "Marquer comme non lu", primary: false },
      ],
    },
    {
      id: 4,
      type: "promo",
      title: "Nouvelle promotion disponible",
      content:
        "TattooArtist1 offre 20% de réduction sur les tatouages flash jusqu'au 25 avril!",
      time: "Hier, 18:42",
      date: "Hier",
      read: false,
      actions: [
        { label: "Voir offre", primary: true },
        { label: "Marquer comme lu", primary: false },
      ],
    },
    {
      id: 5,
      type: "comment",
      title: "TattooArtist3 a commenté votre design",
      content:
        "J'adore ce style! Les lignes sont superbes et l'ombrage est très bien exécuté.",
      time: "Hier, 15:17",
      date: "Hier",
      read: true,
      actions: [
        { label: "Répondre", primary: true },
        { label: "Marquer comme non lu", primary: false },
      ],
    },
    {
      id: 6,
      type: "newArtist",
      title: "Nouveau tatoueur près de chez vous",
      content:
        "TattooArtist2 a rejoint Inkediin et est situé à 5 km de votre emplacement.",
      time: "16 avril, 09:23",
      date: "Cette semaine",
      read: true,
      actions: [
        { label: "Voir profil", primary: true },
        { label: "Marquer comme non lu", primary: false },
      ],
    },
    {
      id: 7,
      type: "system",
      title: "Mise à jour du système",
      content:
        "Nous avons mis à jour notre plateforme avec de nouvelles fonctionnalités. Découvrez ce qui a changé!",
      time: "15 avril, 14:00",
      date: "Cette semaine",
      read: true,
      actions: [
        { label: "En savoir plus", primary: true },
        { label: "Marquer comme non lu", primary: false },
      ],
    },
  ];

  // Filtrage des notifications en fonction de l'onglet actif
  const filteredNotifications =
    activeTab === "Toutes"
      ? notifications
      : activeTab === "Messages"
      ? notifications.filter(
          (notif) => notif.type === "message" || notif.type === "comment"
        )
      : activeTab === "Rendez-vous"
      ? notifications.filter((notif) => notif.type === "appointment")
      : activeTab === "Promotions"
      ? notifications.filter((notif) => notif.type === "promo")
      : activeTab === "Mentions J'aime"
      ? notifications.filter((notif) => notif.type === "like")
      : notifications.filter(
          (notif) => notif.type === "system" || notif.type === "newArtist"
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

  const unreadCount = notifications.filter((notif) => !notif.read).length;

  const markAllAsRead = () => {
    // Logique pour marquer toutes les notifications comme lues
    console.log("Marquer toutes les notifications comme lues");
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8">
      <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-5">
        Notifications
      </h2>

      {/* En-tête avec compteur et bouton "tout marquer comme lu" */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <span className="font-medium">
            Toutes les notifications
            <span className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
              {unreadCount}
            </span>
          </span>
        </div>
        <button
          onClick={markAllAsRead}
          className="text-sm text-red-500 hover:text-red-600 flex items-center"
        >
          <Check size={16} className="mr-1" />
          Tout marquer comme lu
        </button>
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
                  className={`bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden
                    ${!notification.read ? "border-l-4 border-red-500" : ""}`}
                >
                  <div className="p-4 sm:p-5 flex">
                    {/* Icon */}
                    <div className="flex-shrink-0 mr-4 bg-gray-100 dark:bg-gray-700 rounded-full p-2">
                      {notificationIcons[notification.type]}
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
                          >
                            {action.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* More options dropdown */}
                    <div className="flex-shrink-0 self-start">
                      <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                        <MoreVertical size={20} className="text-gray-500" />
                      </button>
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
}
