// debug-startup.js - Vérifier pourquoi le serveur s'arrête

console.log('🚀 DÉBUT DU DEBUG STARTUP');
console.log('Time:', new Date().toISOString());

// Test 1: Vérifier les variables d'environnement
console.log('\n1. 📋 Variables d\'environnement:');
require('dotenv').config();
console.log('MONGO_URL:', process.env.MONGO_URL ? '✅ Définie' : '❌ Manquante');
console.log('PORT:', process.env.PORT || 'Défaut 3000');
console.log('CLIENT_URL:', process.env.CLIENT_URL || 'Non définie');

// Test 2: Test de connexion MongoDB
console.log('\n2. 🗄️ Test connexion MongoDB...');
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URL)
  .then(() => {
    console.log('✅ MongoDB connecté avec succès');
    
    // Test 3: Créer un serveur Express simple
    console.log('\n3. 🌐 Création serveur Express...');
    const express = require('express');
    const cors = require('cors');
    const cookieParser = require('cookie-parser');
    
    const app = express();
    const PORT = process.env.PORT || 3000;
    
    // Configuration
    app.use(cors({ 
      origin: process.env.CLIENT_URL || "http://localhost:5173", 
      credentials: true 
    }));
    app.use(express.json());
    app.use(cookieParser());
    
    // Route de test
    app.get('/api/health', (req, res) => {
      res.json({ 
        status: 'OK', 
        message: 'Serveur fonctionne',
        timestamp: new Date().toISOString(),
        mongodb: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
      });
    });
    
    // Test 4: Essayer d'ajouter Socket.IO
    console.log('\n4. 🔌 Ajout Socket.IO...');
    try {
      const { createServer } = require('http');
      const { Server } = require('socket.io');
      
      const serverHttp = createServer(app);
      const io = new Server(serverHttp, {
        cors: {
          origin: process.env.CLIENT_URL || "http://localhost:5173",
          methods: ["GET", "POST", "DELETE", "PUT"],
          credentials: true
        }
      });
      
      console.log('✅ Socket.IO configuré');
      
      // Démarrage du serveur
      console.log('\n5. 🚀 Démarrage du serveur...');
      serverHttp.listen(PORT, () => {
        console.log(`✅ Serveur démarré sur le port ${PORT}`);
        console.log(`📡 Test: http://localhost:${PORT}/api/health`);
        console.log('\n🎉 SERVEUR FONCTIONNEL !');
      });
      
      // Gestion des connexions Socket.IO
      io.on('connection', (socket) => {
        console.log(`👤 Client connecté: ${socket.id}`);
        
        socket.on('disconnect', () => {
          console.log(`👋 Client déconnecté: ${socket.id}`);
        });
      });
      
    } catch (socketError) {
      console.log('❌ Erreur Socket.IO:', socketError.message);
      
      // Fallback: serveur Express simple
      console.log('\n🔄 Fallback: serveur Express simple...');
      app.listen(PORT, () => {
        console.log(`✅ Serveur Express simple démarré sur le port ${PORT}`);
        console.log(`📡 Test: http://localhost:${PORT}/api/health`);
      });
    }
    
  })
  .catch((mongoError) => {
    console.log('❌ Erreur MongoDB:', mongoError.message);
    console.log('Stack:', mongoError.stack);
    
    // Essayer de démarrer sans MongoDB pour tester
    console.log('\n🔄 Test serveur sans MongoDB...');
    const express = require('express');
    const app = express();
    const PORT = process.env.PORT || 3000;
    
    app.get('/api/health', (req, res) => {
      res.json({ 
        status: 'OK (Sans MongoDB)', 
        message: 'Serveur fonctionne mais MongoDB déconnecté',
        timestamp: new Date().toISOString()
      });
    });
    
    app.listen(PORT, () => {
      console.log(`⚠️ Serveur de test démarré sur le port ${PORT} (SANS MongoDB)`);
      console.log(`📡 Test: http://localhost:${PORT}/api/health`);
    });
  });

// Gestion des erreurs non capturées
process.on('uncaughtException', (error) => {
  console.log('💥 Erreur non capturée:', error.message);
  console.log('Stack:', error.stack);
});

process.on('unhandledRejection', (reason, promise) => {
  console.log('💥 Promesse rejetée:', reason);
});

console.log('\n⏳ En attente de la connexion MongoDB...');