const { Server } = require("socket.io");
const http = require("http");
const express = require("express");
const jwt = require("jsonwebtoken");

const app = express();
const serverHttp = http.createServer(app);
const io = new Server(serverHttp, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST", "DELETE", "PUT"],
  },
});

const userSocketMap = {};

const getReceiverSocketId = (receiverId) => {
  return userSocketMap[receiverId];
};

// Middleware d'authentification pour Socket.IO
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token || socket.handshake.query.token;
    
    if (!token) {
      return next(new Error('Token manquant'));
    }

    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    const User = require("../models/user.model");
    const user = await User.findById(decoded.sub);

    if (!user) {
      return next(new Error('Utilisateur non trouvé'));
    }

    socket.userId = user._id.toString();
    socket.user = user;
    next();
  } catch (error) {
    next(new Error('Authentification échouée'));
  }
});

io.on("connection", (socket) => {
  console.log("Utilisateur connecté:", socket.id);
  
  const userId = socket.userId;
  
  if (userId) {
    userSocketMap[userId] = socket.id;
    console.log(`Utilisateur ${userId} mappé au socket ${socket.id}`);
    
    // Joindre l'utilisateur à sa propre room pour les notifications
    socket.join(userId);
  }

  // Émettre la liste des utilisateurs en ligne
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // Gérer la demande de notifications en temps réel
  socket.on("joinNotificationRoom", () => {
    if (userId) {
      socket.join(`notifications-${userId}`);
      console.log(`Utilisateur ${userId} a rejoint la room des notifications`);
    }
  });

  // Gérer la déconnexion
  socket.on("disconnect", () => {
    console.log("Utilisateur déconnecté:", socket.id);
    if (userId) {
      delete userSocketMap[userId];
      io.emit("getOnlineUsers", Object.keys(userSocketMap));
    }
  });

  // Gérer l'événement de frappe en cours
  socket.on("typing", ({ conversationId, userId }) => {
    socket.to(conversationId).emit("userTyping", { userId });
  });

  socket.on("stopTyping", ({ conversationId, userId }) => {
    socket.to(conversationId).emit("userStoppedTyping", { userId });
  });

  // Événement pour marquer une notification comme lue en temps réel
  socket.on("markNotificationRead", async ({ notificationId }) => {
    try {
      const Notification = require("../models/notification.model");
      await Notification.findOneAndUpdate(
        { _id: notificationId, idUser: userId },
        { lu: true }
      );
      
      // Confirmer à l'utilisateur que la notification a été marquée comme lue
      socket.emit("notificationMarkedRead", { notificationId });
    } catch (error) {
      socket.emit("error", { message: "Erreur lors du marquage de la notification" });
    }
  });
});

module.exports = { app, serverHttp, io, getReceiverSocketId };