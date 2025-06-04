import React, { useState, useEffect } from "react";
import { NotifContext } from "../../context/NotifContext";
import { ToastContainer } from "../../pages/notifications/components/ToastContainer";

export default function NotifProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const [toastIdCounter, setToastIdCounter] = useState(0);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: "message",
      title: "Nouveau message de TattooArtist1",
      content:
        "Bonjour, j'ai reçu votre demande de rendez-vous. Pouvons-nous discuter de votre projet de tatouage?",
      time: "Il y a 30 minutes",
      date: "Aujourd'hui",
      read: false,
      starred: false,
      archived: false,
      actions: [
        { label: "Répondre", primary: true },
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
      starred: true,
      archived: false,
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
      starred: false,
      archived: false,
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
      starred: false,
      archived: false,
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
      starred: false,
      archived: true,
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
      starred: false,
      archived: false,
      actions: [
        { label: "En savoir plus", primary: true },
        { label: "Marquer comme non lu", primary: false },
      ],
    },
  ]);

  // Suppression d'un toast
  const removeToast = (id) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  };

  // Ajout d'un nouveau toast
  const addToast = (type, message, duration = 5000) => {
    const newId = toastIdCounter;
    setToastIdCounter(toastIdCounter + 1);

    setToasts((prevToasts) => [
      ...prevToasts,
      { id: newId, type, message, duration },
    ]);
  };

  // Marquer une notification comme lue ou non lue
  const markAsRead = (id, currentState) => {
    setNotifications((prevNotifs) =>
      prevNotifs.map((notif) =>
        notif.id === id
          ? {
              ...notif,
              read: !currentState,
              actions: notif.actions.map((action) => ({
                ...action,
                label: !action.primary
                  ? currentState
                    ? "Marquer comme lu"
                    : "Marquer comme non lu"
                  : action.label,
              })),
            }
          : notif
      )
    );

    // Toast de confirmation
    addToast(
      "success",
      !currentState ? "Notification marquée comme lue" : "Notification marquée comme non lue",
      3000
    );
  };

  // Marquer toutes les notifications comme lues
  const markAllAsRead = () => {
    const unreadCount = notifications.filter(notif => !notif.read).length;
    
    setNotifications((prevNotifs) =>
      prevNotifs.map((notif) => ({
        ...notif,
        read: true,
        actions: notif.actions.map((action) => ({
          ...action,
          label: !action.primary ? "Marquer comme non lu" : action.label,
        })),
      }))
    );

    if (unreadCount > 0) {
      addToast("success", `${unreadCount} notification(s) marquée(s) comme lue(s)`, 3000);
    }
  };

  // Ajouter une nouvelle notification
  const addNotification = (notification) => {
    const newId =
      notifications.length > 0
        ? Math.max(...notifications.map((n) => n.id)) + 1
        : 1;

    setNotifications((prev) => [
      {
        id: newId,
        date: "Aujourd'hui",
        read: false,
        starred: false,
        archived: false,
        ...notification,
      },
      ...prev,
    ]);

    // Ajouter aussi un toast pour alerter l'utilisateur
    addToast(notification.type, notification.title);
  };

  // Supprimer une notification
  const deleteNotification = (id) => {
    const notification = notifications.find(notif => notif.id === id);
    
    setNotifications((prevNotifs) =>
      prevNotifs.filter((notif) => notif.id !== id)
    );

    if (notification) {
      addToast("info", "Notification supprimée", 3000);
    }
  };

  // Archiver/désarchiver une notification
  const archiveNotification = (id) => {
    setNotifications((prevNotifs) =>
      prevNotifs.map((notif) =>
        notif.id === id
          ? { ...notif, archived: !notif.archived }
          : notif
      )
    );

    const notification = notifications.find(notif => notif.id === id);
    if (notification) {
      addToast(
        "info",
        notification.archived ? "Notification désarchivée" : "Notification archivée",
        3000
      );
    }
  };

  // Marquer/démarquer une notification comme favorite
  const starNotification = (id) => {
    setNotifications((prevNotifs) =>
      prevNotifs.map((notif) =>
        notif.id === id
          ? { ...notif, starred: !notif.starred }
          : notif
      )
    );

    const notification = notifications.find(notif => notif.id === id);
    if (notification) {
      addToast(
        "info",
        notification.starred ? "Notification retirée des favoris" : "Notification ajoutée aux favoris",
        3000
      );
    }
  };

  // Obtenir le nombre de notifications non lues
  const getUnreadCount = () => {
    return notifications.filter(notif => !notif.read && !notif.archived).length;
  };

  // Obtenir le nombre de notifications favorites
  const getStarredCount = () => {
    return notifications.filter(notif => notif.starred && !notif.archived).length;
  };

  // Obtenir le nombre de notifications archivées
  const getArchivedCount = () => {
    return notifications.filter(notif => notif.archived).length;
  };

  // Filtrer les notifications par statut
  const getNotificationsByStatus = (status) => {
    switch (status) {
      case "unread":
        return notifications.filter(notif => !notif.read && !notif.archived);
      case "starred":
        return notifications.filter(notif => notif.starred && !notif.archived);
      case "archived":
        return notifications.filter(notif => notif.archived);
      case "active":
        return notifications.filter(notif => !notif.archived);
      default:
        return notifications;
    }
  };

  const contextValue = {
    // Toast functions
    toasts,
    addToast,
    removeToast,
    
    // Notification data
    notifications,
    
    // Basic notification functions
    markAsRead,
    markAllAsRead,
    addNotification,
    
    // New dropdown functions
    deleteNotification,
    archiveNotification,
    starNotification,
    
    // Utility functions
    getUnreadCount,
    getStarredCount,
    getArchivedCount,
    getNotificationsByStatus,
  };

  return (
    <NotifContext.Provider value={contextValue}>
      {children}
      <ToastContainer />
    </NotifContext.Provider>
  );
}