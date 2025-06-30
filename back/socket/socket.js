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
    credentials: true 
  },
});

const userSocketMap = {};

const getReceiverSocketId = (receiverId) => {
  return userSocketMap[receiverId];
};

// Middleware d'authentification pour Socket.IO - AMÉLIORÉ
io.use(async (socket, next) => {
  try {
   
    
    // 1. Essayer de récupérer le token depuis l'auth
    let token = socket.handshake.auth.token;
    
    
    // 2. Si pas de token dans auth, essayer query
    if (!token) {
      token = socket.handshake.query.token;
    
    }
    
    // 3. Si pas de token, essayer les cookies
    if (!token && socket.handshake.headers.cookie) {
      const cookies = parseCookies(socket.handshake.headers.cookie);
      token = cookies.token || cookies.authToken || cookies.jwt;
     
    }
    
    if (!token) {
      console.error('❌ Aucun token trouvé pour WebSocket');
      return next(new Error('Token manquant'));
    }

    // 4. Vérifier le token
  
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    
    
    const User = require("../models/user.model");
    const user = await User.findById(decoded.sub);

    if (!user) {
      console.error('❌ Utilisateur non trouvé:', decoded.sub);
      return next(new Error('Utilisateur non trouvé'));
    }

    
    socket.userId = user._id.toString();
    socket.user = user;
    next();
  } catch (error) {
    console.error('❌ Erreur d\'authentification WebSocket:', error.message);
    next(new Error('Authentification échouée: ' + error.message));
  }
});

// Fonction utilitaire pour parser les cookies
function parseCookies(cookieString) {
  const cookies = {};
  if (cookieString) {
    cookieString.split(';').forEach(cookie => {
      const parts = cookie.trim().split('=');
      if (parts.length === 2) {
        cookies[parts[0]] = decodeURIComponent(parts[1]);
      }
    });
  }
  return cookies;
}

io.on("connection", (socket) => {
 
  
  const userId = socket.userId;
  
  if (userId) {
    userSocketMap[userId] = socket.id;
    
    
    // Joindre l'utilisateur à sa propre room pour les notifications
    socket.join(userId);
    
    // AJOUTER CET ÉVÉNEMENT - Confirmer l'authentification au client
    socket.emit('authenticated', { 
      message: 'Authentification réussie',
      user: { 
        id: userId, 
        nom: socket.user.nom,
        userType: socket.user.userType 
      }
    });
  }

  // Émettre la liste des utilisateurs en ligne
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // Gérer la demande de notifications en temps réel
  socket.on("joinNotificationRoom", () => {
    if (userId) {
      socket.join(`notifications-${userId}`);
     
    }
  });

  // AJOUTER CET ÉVÉNEMENT - Test de connexion
  socket.on("test", (data) => {
    
    socket.emit("test-response", { 
      message: 'Test reçu avec succès', 
      originalData: data,
      timestamp: new Date().toISOString(),
      user: socket.user?.nom
    });
  });

  // Gérer la déconnexion
  socket.on("disconnect", (reason) => {
   
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
      console.error('❌ Erreur marquage notification:', error);
      socket.emit("error", { message: "Erreur lors du marquage de la notification" });
    }
  });
});

module.exports = { app, serverHttp, io, getReceiverSocketId };