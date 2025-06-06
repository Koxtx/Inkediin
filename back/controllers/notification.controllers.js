const Notification = require("../models/notification.model");
const { io, getReceiverSocketId } = require("../socket/socket");

const getNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    const notifications = await Notification.find({ idUser: userId })
      .sort({ createdAt: -1 })
      .populate('relatedId', 'contenu prix image', 'Flash Feed Messagerie Reservation');
    
    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user._id;

    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, idUser: userId },
      { lu: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: "Notification non trouvée" });
    }

    res.status(200).json(notification);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user._id;

    await Notification.updateMany(
      { idUser: userId, lu: false },
      { lu: true }
    );

    res.status(200).json({ message: "Toutes les notifications ont été marquées comme lues" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user._id;
    const count = await Notification.countDocuments({ 
      idUser: userId, 
      lu: false 
    });
    
    res.status(200).json({ count });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Fonction utilitaire pour créer et envoyer une notification
const createAndSendNotification = async (notificationData) => {
  try {
    const notification = new Notification(notificationData);
    await notification.save();

    // Envoyer la notification via WebSocket
    const receiverSocketId = getReceiverSocketId(notificationData.idUser.toString());
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newNotification", {
        ...notification.toObject(),
        isNew: true
      });
    }

    // Envoyer aussi à la room de l'utilisateur (au cas où il a plusieurs onglets)
    io.to(notificationData.idUser.toString()).emit("newNotification", {
      ...notification.toObject(),
      isNew: true
    });

    return notification;
  } catch (error) {
    console.error("Erreur lors de la création de la notification:", error);
    return null;
  }
};

// Fonctions spécialisées pour différents types de notifications
const createMessageNotification = async (senderId, receiverId, messageContent) => {
  return await createAndSendNotification({
    idUser: receiverId,
    userType: 'Client', // ou déterminer dynamiquement
    type: 'message',
    contenu: `Nouveau message de ${senderId}`,
    relatedId: senderId,
    relatedType: 'Messagerie'
  });
};

const createReservationNotification = async (clientId, tatoueurId, flashId, type = 'reservation') => {
  const contenu = type === 'reservation' 
    ? 'Nouvelle demande de réservation'
    : 'Réponse à votre demande de réservation';
    
  return await createAndSendNotification({
    idUser: type === 'reservation' ? tatoueurId : clientId,
    userType: type === 'reservation' ? 'Tatoueur' : 'Client',
    type: 'reservation',
    contenu,
    relatedId: flashId,
    relatedType: 'Reservation'
  });
};

const createLikeNotification = async (likerId, ownerId, postId, postType) => {
  return await createAndSendNotification({
    idUser: ownerId,
    userType: 'Tatoueur', // ou déterminer dynamiquement
    type: 'like',
    contenu: 'Quelqu\'un a aimé votre publication',
    relatedId: postId,
    relatedType: postType
  });
};

const createCommentNotification = async (commenterId, ownerId, postId, postType) => {
  return await createAndSendNotification({
    idUser: ownerId,
    userType: 'Tatoueur', // ou déterminer dynamiquement
    type: 'commentaire',
    contenu: 'Nouveau commentaire sur votre publication',
    relatedId: postId,
    relatedType: postType
  });
};

const createFollowNotification = async (followerId, followedId) => {
  return await createAndSendNotification({
    idUser: followedId,
    userType: 'Tatoueur',
    type: 'follow',
    contenu: 'Quelqu\'un vous suit maintenant',
    relatedId: followerId,
    relatedType: null
  });
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
  createAndSendNotification,
  createMessageNotification,
  createReservationNotification,
  createLikeNotification,
  createCommentNotification,
  createFollowNotification
};