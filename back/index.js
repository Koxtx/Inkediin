const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();
const path = require("path");
const cookieParser = require("cookie-parser");

// ⚠️ IMPORTANT: Importer serverHttp au lieu de app !
const { serverHttp, app } = require("./socket/socket");

const PORT = process.env.PORT;

// Configuration CORS avec credentials
app.use(cors({ 
  origin: process.env.CLIENT_URL, 
  credentials: true 
}));

app.use(express.json());
app.use(cookieParser());

const __DIRNAME = path.resolve();

// Routes API (AVANT les fichiers statiques)
const feedRoutes = require("./routes/feed.routes");
const flashRoutes = require("./routes/flash.routes");
const messagerieRoutes = require("./routes/messagerie.routes");
const notificationRoutes = require("./routes/notification.routes");
const reservationRoutes = require("./routes/reservation.routes");
const userRoutes = require("./routes/user.routes");

app.use("/api/feeds", feedRoutes);
app.use("/api/flashs", flashRoutes);
app.use("/api/messageries", messagerieRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/reservations", reservationRoutes);
app.use("/api/users", userRoutes);

// Route de test
app.get('/test', (req, res) => {
  res.json({ 
    message: 'Serveur HTTP + WebSocket fonctionne !', 
    timestamp: new Date().toISOString(),
    port: PORT 
  });
});

// Servir les fichiers statiques React (UNE SEULE FOIS)
app.use(express.static(path.join(__DIRNAME, "front/dist")));

// Route catch-all pour React Router (UNE SEULE FOIS, EN DERNIER)
app.get(/(.*)/, (req, res) => {
  res.sendFile(path.join(__DIRNAME, "front/dist/index.html"));
});

// Connexion MongoDB et démarrage serveur
mongoose.connect(process.env.MONGO_URL).then(() => {
  console.log("✅ MongoDB connected");
  
  // ⚠️ IMPORTANT: Utiliser serverHttp au lieu de app !
  serverHttp.listen(PORT, () => {
    console.log(`🚀 Serveur HTTP + WebSocket démarré sur le port ${PORT}`);
    console.log(`🔌 WebSocket disponible sur ws://localhost:${PORT}`);
    console.log(`📡 API disponible sur http://localhost:${PORT}`);
    console.log(`🌐 CORS configuré pour: ${process.env.CLIENT_URL}`);
  });
}).catch((error) => {
  console.error("❌ Erreur MongoDB:", error);
});