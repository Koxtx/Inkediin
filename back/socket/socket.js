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
    credentials: true // Ajouté pour les cookies
  },
});

const userSocketMap = {};

const getReceiverSocketId = (receiverId) => {
  return userSocketMap[receiverId];
};

// Middleware d'authentification pour Socket.IO - AMÉLIORÉ
io.use(async (socket, next) => {
  try {
    console.log('🔐 Tentative d\'authentification WebSocket');
    console.log('📋 Headers:', socket.handshake.headers.cookie ? 'Cookies présents' : 'Pas de cookies');
    
    // 1. Essayer de récupérer le token depuis l'auth
    let token = socket.handshake.auth.token;
    console.log('🎫 Token depuis auth:', token ? 'Présent' : 'Absent');
    
    // 2. Si pas de token dans auth, essayer query
    if (!token) {
      token = socket.handshake.query.token;
      console.log('🎫 Token depuis query:', token ? 'Présent' : 'Absent');
    }
    
    // 3. Si pas de token, essayer les cookies
    if (!token && socket.handshake.headers.cookie) {
      const cookies = parseCookies(socket.handshake.headers.cookie);
      token = cookies.token || cookies.authToken || cookies.jwt;
      console.log('🍪 Cookies parsés:', Object.keys(cookies));
      console.log('🎫 Token depuis cookies:', token ? 'Présent' : 'Absent');
    }
    
    if (!token) {
      console.error('❌ Aucun token trouvé pour WebSocket');
      return next(new Error('Token manquant'));
    }

    // 4. Vérifier le token
    console.log('🔍 Vérification du token...');
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    console.log('✅ Token décodé pour utilisateur:', decoded.sub);
    
    const User = require("../models/user.model");
    const user = await User.findById(decoded.sub);

    if (!user) {
      console.error('❌ Utilisateur non trouvé:', decoded.sub);
      return next(new Error('Utilisateur non trouvé'));
    }

    console.log('✅ Utilisateur authentifié:', user.nom, '(' + user._id + ')');
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
  console.log("✅ Utilisateur WebSocket connecté:", socket.id);
  console.log("👤 Utilisateur:", socket.user?.nom, "ID:", socket.userId);
  
  const userId = socket.userId;
  
  if (userId) {
    userSocketMap[userId] = socket.id;
    console.log(`🔗 Utilisateur ${socket.user.nom} (${userId}) mappé au socket ${socket.id}`);
    
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
      console.log(`📬 Utilisateur ${socket.user.nom} a rejoint la room des notifications`);
    }
  });

  // AJOUTER CET ÉVÉNEMENT - Test de connexion
  socket.on("test", (data) => {
    console.log('🧪 Test reçu de', socket.user?.nom, ':', data);
    socket.emit("test-response", { 
      message: 'Test reçu avec succès', 
      originalData: data,
      timestamp: new Date().toISOString(),
      user: socket.user?.nom
    });
  });

  // Gérer la déconnexion
  socket.on("disconnect", (reason) => {
    console.log("❌ Utilisateur déconnecté:", socket.id, "Raison:", reason);
    if (userId) {
      console.log(`👋 ${socket.user?.nom} s'est déconnecté`);
      delete userSocketMap[userId];
      io.emit("getOnlineUsers", Object.keys(userSocketMap));
    }
  });

  // Gérer l'événement de frappe en cours
  socket.on("typing", ({ conversationId, userId }) => {
    console.log(`✏️ ${socket.user?.nom} tape dans conversation ${conversationId}`);
    socket.to(conversationId).emit("userTyping", { userId });
  });

  socket.on("stopTyping", ({ conversationId, userId }) => {
    console.log(`✏️ ${socket.user?.nom} a arrêté de taper dans conversation ${conversationId}`);
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
      
      console.log(`📧 Notification ${notificationId} marquée comme lue par ${socket.user?.nom}`);
      
      // Confirmer à l'utilisateur que la notification a été marquée comme lue
      socket.emit("notificationMarkedRead", { notificationId });
    } catch (error) {
      console.error('❌ Erreur marquage notification:', error);
      socket.emit("error", { message: "Erreur lors du marquage de la notification" });
    }
  });
});

module.exports = { app, serverHttp, io, getReceiverSocketId };