// isolate.js - Créer un serveur minimal pour isoler le problème

console.log('🚀 ISOLATION DU PROBLÈME\n');

// Étape 1: Test de base Express
console.log('1. Test Express de base...');
try {
  const express = require('express');
  const app = express();
  
  app.get('/test', (req, res) => {
    res.json({ message: 'Express fonctionne' });
  });
  
  console.log('   ✅ Express OK\n');
} catch (error) {
  console.log('   ❌ Express ERREUR:', error.message);
  process.exit(1);
}

// Étape 2: Test Socket.IO
console.log('2. Test Socket.IO...');
try {
  const { createServer } = require('http');
  const { Server } = require('socket.io');
  
  const httpServer = createServer();
  const io = new Server(httpServer, {
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST", "DELETE", "PUT"],
      credentials: true
    }
  });
  
  console.log('   ✅ Socket.IO OK\n');
} catch (error) {
  console.log('   ❌ Socket.IO ERREUR:', error.message);
  console.log('   Stack:', error.stack);
}

// Étape 3: Test de chargement de chaque route individuellement
console.log('3. Test de chargement des routes...');

const routeFiles = [
  './routes/feed.routes.js',
  './routes/flash.routes.js', 
  './routes/messagerie.routes.js',
  './routes/notification.routes.js',
  './routes/reservation.routes.js',
  './routes/user.routes.js'
];

routeFiles.forEach(routeFile => {
  try {
    console.log(`   Testing ${routeFile}...`);
    require(routeFile);
    console.log(`   ✅ ${routeFile} OK`);
  } catch (error) {
    console.log(`   ❌ ${routeFile} ERREUR:`, error.message);
    if (error.message.includes('path-to-regexp')) {
      console.log('   🎯 PROBLÈME TROUVÉ dans', routeFile);
      console.log('   Stack:', error.stack);
    }
  }
});

// Étape 4: Test du fichier socket/socket.js s'il existe
console.log('\n4. Test socket/socket.js...');
try {
  if (require('fs').existsSync('./socket/socket.js')) {
    console.log('   Chargement de socket/socket.js...');
    require('./socket/socket.js');
    console.log('   ✅ socket/socket.js OK');
  } else {
    console.log('   ⚠️ socket/socket.js non trouvé');
  }
} catch (error) {
  console.log('   ❌ socket/socket.js ERREUR:', error.message);
  if (error.message.includes('path-to-regexp')) {
    console.log('   🎯 PROBLÈME TROUVÉ dans socket/socket.js');
    console.log('   Stack:', error.stack);
  }
}

// Étape 5: Test index.js ou app.js
console.log('\n5. Test des fichiers principaux...');
['./index.js', './app.js'].forEach(mainFile => {
  if (require('fs').existsSync(mainFile)) {
    console.log(`   Testing ${mainFile}...`);
    try {
      // Ne pas exécuter, juste vérifier la syntaxe
      const content = require('fs').readFileSync(mainFile, 'utf8');
      
      // Chercher des patterns suspects
      const suspiciousPatterns = [
        /router\.(get|post|put|delete|patch)\s*\(\s*['"`][^'"`]*::/, // Double deux-points
        /router\.(get|post|put|delete|patch)\s*\(\s*['"`][^'"`]*:\s/, // Deux-points + espace
        /router\.(get|post|put|delete|patch)\s*\(\s*['"`][^'"`]*:\)/, // Deux-points + parenthèse
        /app\.use\s*\(\s*['"`][^'"`]*::/, // app.use avec double deux-points
      ];
      
      let foundIssues = false;
      content.split('\n').forEach((line, index) => {
        suspiciousPatterns.forEach(pattern => {
          if (pattern.test(line)) {
            console.log(`   ❌ Pattern suspect ligne ${index + 1}:`, line.trim());
            foundIssues = true;
          }
        });
      });
      
      if (!foundIssues) {
        console.log(`   ✅ ${mainFile} - Aucun pattern suspect`);
      }
      
    } catch (error) {
      console.log(`   ❌ ${mainFile} ERREUR:`, error.message);
    }
  }
});

console.log('\n✅ Test d\'isolation terminé');
console.log('\n📋 PROCHAINES ÉTAPES:');
console.log('1. Exécutez: node isolate.js');
console.log('2. Identifiez quel fichier cause l\'erreur');
console.log('3. Examinez ce fichier en détail');
console.log('4. Si aucun problème n\'est trouvé, vérifiez les versions:');
console.log('   npm ls path-to-regexp');
console.log('   npm ls express');
console.log('   npm ls socket.io');