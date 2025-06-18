const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();
const cookieParser = require("cookie-parser");

// ⚠️ IMPORTANT: Importer serverHttp au lieu de app !
const { createServer } = require("http");
const { Server } = require("socket.io");

const PORT = process.env.PORT || 3000;

console.log('🚀 Démarrage du serveur...');

// Créer l'app Express
const app = express();

// Configuration CORS avec credentials
app.use(cors({ 
  origin: process.env.CLIENT_URL || "http://localhost:5173", 
  credentials: true 
}));

app.use(express.json());
app.use(cookieParser());

// Routes
const feedRoutes = require("./routes/feed.routes");
const flashRoutes = require("./routes/flash.routes");
const messagerieRoutes = require("./routes/messagerie.routes");
const notificationRoutes = require("./routes/notification.routes");
const reservationRoutes = require("./routes/reservation.routes");
const userRoutes = require("./routes/user.routes");

// Servir les fichiers statiques (images uploadées)
app.use('/uploads', express.static('uploads'));

// Ou si vous voulez être plus précis :
app.use('/uploads/feeds', express.static('uploads/feeds'));
app.use('/uploads/flashs', express.static('uploads/flashs'));

// ✅ Route de test pour vérifier les images
app.get('/test-image', (req, res) => {
  res.json({
    message: 'Test des images',
    example: 'http://localhost:3000/uploads/feeds/image-1750251778826-412283191.png',
    instructions: 'Copiez cette URL dans votre navigateur pour tester'
  });
});

app.use("/api/feed", feedRoutes);
app.use("/api/flashs", flashRoutes);
app.use("/api/messageries", messagerieRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/reservations", reservationRoutes);
app.use("/api/users", userRoutes);

// Route de test
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'API fonctionnelle !', 
    timestamp: new Date().toISOString(),
    port: PORT,
    mongodb: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
  });
});

// Configuration HTTP + Socket.IO
const serverHttp = createServer(app);
const io = new Server(serverHttp, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST", "DELETE", "PUT"],
    credentials: true
  }
});

// Gestion des connexions Socket.IO
io.on("connection", (socket) => {
  console.log(`👤 Client connecté: ${socket.id}`);
  
  // Gestion des événements Socket.IO
  socket.on("joinNotificationRoom", () => {
    console.log(`🔔 ${socket.id} a rejoint les notifications`);
  });
  
  socket.on("disconnect", () => {
    console.log(`👋 Client déconnecté: ${socket.id}`);
  });
});

// Route 404
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route non trouvée',
    path: req.originalUrl,
    method: req.method,
    availableRoutes: [
      'GET /api/health',
      'GET /api/feed',
      'POST /api/feed',
      'GET /api/feed/followed',
      'GET /api/feed/recommended'
    ]
  });
});

// Middleware de gestion d'erreurs globales
app.use((error, req, res, next) => {
  console.error('Erreur serveur:', error);
  res.status(500).json({ 
    error: 'Erreur interne du serveur',
    ...(process.env.NODE_ENV === 'development' && { details: error.message })
  });
});

// Connexion MongoDB et démarrage serveur
console.log('🔗 Connexion à MongoDB...');
mongoose.connect(process.env.MONGO_URL).then(() => {
  console.log("✅ MongoDB connecté");
  
  // ⚠️ IMPORTANT: Utiliser serverHttp au lieu de app !
  serverHttp.listen(PORT, () => {
    console.log(`🚀 Serveur HTTP + WebSocket démarré sur le port ${PORT}`);
    console.log(`🔌 WebSocket disponible sur ws://localhost:${PORT}`);
    console.log(`📡 API disponible sur http://localhost:${PORT}`);
    console.log(`🌐 CORS configuré pour: ${process.env.CLIENT_URL || "http://localhost:5173"}`);
    console.log(`📋 Test: curl http://localhost:${PORT}/api/health`);
  });
}).catch((error) => {
  console.error("❌ Erreur MongoDB:", error);
});

// Gestion des erreurs non capturées
process.on('uncaughtException', (error) => {
  console.error('💥 Erreur non capturée:', error);
});

process.on('unhandledRejection', (reason) => {
  console.error('💥 Promesse rejetée:', reason);
});