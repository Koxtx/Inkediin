const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();
const path = require("path");
const cookieParser = require("cookie-parser");

// ✅ Importer app depuis socket.js
const { serverHttp, app, io } = require("./socket/socket");

const PORT = process.env.PORT || 3000;

// ✅ Configuration des middlewares sur app
app.use(cors({ 
  origin: process.env.CLIENT_URL, 
  credentials: true 
}));

app.use(express.json());
app.use(cookieParser());

// ✅ Routes API
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

// ✅ Fichiers statiques uniquement si pas en test
if (process.env.NODE_ENV !== 'test') {
  const __DIRNAME = path.resolve();
  app.use(express.static(path.join(__DIRNAME, "front/dist")));
  
  app.get(/(.*)/, (req, res) => {
    res.sendFile(path.join(__DIRNAME, "front/dist/index.html"));
  });
}

// ✅ Connexion MongoDB et démarrage serveur uniquement si pas en test
if (process.env.NODE_ENV !== 'test') {
  mongoose.connect(process.env.MONGO_URL).then(() => {
    console.log("✅ MongoDB connected");
    serverHttp.listen(PORT, () => {
      console.log(`🚀 Serveur HTTP + WebSocket démarré sur le port ${PORT}`);
      console.log(`🔌 WebSocket disponible sur ws://localhost:${PORT}`);
      console.log(`📡 API disponible sur http://localhost:${PORT}`);
      console.log(`🌐 CORS configuré pour: ${process.env.CLIENT_URL}`);
    });
  }).catch((error) => {
    console.error("❌ Erreur MongoDB:", error);
  });
}

// ✅ Exporter app pour les tests
module.exports = app;