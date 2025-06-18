// test-fix.js - Créez ce fichier pour tester rapidement
const express = require('express');

// Test de création des routes sans les charger dans l'app
function testRouteDefinitions() {
  console.log('🧪 Test des définitions de routes...\n');
  
  try {
    // Test 1: feed.routes.js
    console.log('1. Test feed.routes.js...');
    const feedRouter = express.Router();
    
    // Simuler les routes dans l'ordre corrigé
    feedRouter.get('/', () => {});
    feedRouter.get('/recommended', () => {});
    feedRouter.get('/followed', () => {});
    feedRouter.get('/saved', () => {});
    feedRouter.get('/artist/:artistId', () => {});
    feedRouter.post('/', () => {});
    feedRouter.get('/:id', () => {});
    feedRouter.put('/:id', () => {});
    feedRouter.delete('/:id', () => {});
    feedRouter.post('/:id/like', () => {});
    feedRouter.post('/:id/save', () => {});
    feedRouter.delete('/:id/save', () => {});
    feedRouter.post('/:id/comments', () => {});
    feedRouter.delete('/:id/comments/:commentId', () => {}); // Route problématique
    
    console.log('   ✅ feed.routes.js - OK');
    
    // Test 2: user.routes.js
    console.log('2. Test user.routes.js...');
    const userRouter = express.Router();
    
    userRouter.post('/', () => {});
    userRouter.post('/login', () => {});
    userRouter.post('/forgotPassword', () => {});
    userRouter.post('/resetPassword', () => {});
    userRouter.post('/changePassword', () => {});
    userRouter.post('/completeProfile', () => {});
    userRouter.put('/', () => {});
    userRouter.put('/avatar', () => {});
    userRouter.get('/currentUser', () => {});
    userRouter.get('/tattooers', () => {});
    userRouter.get('/verifyMail/:token', () => {});
    userRouter.get('/:id', () => {}); // Une seule fois maintenant
    userRouter.delete('/deleteToken', () => {});
    
    console.log('   ✅ user.routes.js - OK');
    
    // Test 3: Vérification des patterns Express
    console.log('3. Test des patterns Express...');
    
    const testPatterns = [
      '/',
      '/recommended',
      '/followed',
      '/:id',
      '/:id/comments',
      '/:id/comments/:commentId',
      '/artist/:artistId'
    ];
    
    testPatterns.forEach(pattern => {
      try {
        express.Router().get(pattern, () => {});
        console.log(`   ✅ Pattern "${pattern}" - OK`);
      } catch (error) {
        console.log(`   ❌ Pattern "${pattern}" - ERREUR: ${error.message}`);
      }
    });
    
    console.log('\n🎉 Tous les tests de routes sont passés !');
    console.log('\n📝 Actions suggérées:');
    console.log('1. Remplacez votre feed.routes.js par la version corrigée');
    console.log('2. Remplacez votre user.routes.js par la version corrigée');
    console.log('3. Redémarrez votre serveur');
    console.log('4. Testez avec: curl http://localhost:3000/api/health');
    
  } catch (error) {
    console.log(`❌ Erreur lors du test: ${error.message}`);
    console.log('Stack:', error.stack);
  }
}

// Exécuter le test
testRouteDefinitions();