// Créez ce fichier: diagnostic.js
// Exécutez avec: node diagnostic.js

const fs = require('fs');
const path = require('path');

// Fonction pour analyser un fichier de routes
function analyzeRouteFile(filePath) {
  console.log(`\n🔍 Analyse de: ${filePath}`);
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    lines.forEach((line, index) => {
      // Rechercher les définitions de routes
      const routeMatch = line.match(/router\.(get|post|put|delete|patch)\s*\(\s*['"`]([^'"`]+)['"`]/);
      
      if (routeMatch) {
        const method = routeMatch[1];
        const route = routeMatch[2];
        
        console.log(`  Ligne ${index + 1}: ${method.toUpperCase()} ${route}`);
        
        // Vérifier les patterns problématiques
        if (route.includes('::')) {
          console.log(`    ❌ ERREUR: Deux points doubles dans "${route}"`);
        }
        if (route.includes('/:') && route.indexOf(':', route.indexOf('/:') + 2) !== -1) {
          console.log(`    ❌ ERREUR: Paramètres malformés dans "${route}"`);
        }
        if (route.includes('*:') || route.includes(':*')) {
          console.log(`    ❌ ERREUR: Wildcard mal placé dans "${route}"`);
        }
        if (route.match(/:[^a-zA-Z]/)) {
          console.log(`    ❌ ERREUR: Paramètre invalide dans "${route}"`);
        }
        if (route.includes('/:)') || route.includes(':/)')) {
          console.log(`    ❌ ERREUR: Parenthèse mal placée dans "${route}"`);
        }
      }
    });
  } catch (error) {
    console.log(`    ❌ Erreur de lecture: ${error.message}`);
  }
}

// Analyser tous les fichiers de routes
const routesDir = './routes';

console.log('🚀 DIAGNOSTIC DES ROUTES EXPRESS\n');

if (fs.existsSync(routesDir)) {
  const files = fs.readdirSync(routesDir);
  
  files.forEach(file => {
    if (file.endsWith('.routes.js') || file.endsWith('.route.js')) {
      const filePath = path.join(routesDir, file);
      analyzeRouteFile(filePath);
    }
  });
} else {
  console.log('❌ Dossier ./routes non trouvé');
}

// Analyser app.js aussi
if (fs.existsSync('./app.js')) {
  analyzeRouteFile('./app.js');
}

console.log('\n✅ Diagnostic terminé\n');

// Proposer des corrections automatiques
console.log('🔧 CORRECTIONS SUGGÉRÉES:');
console.log('1. Vérifiez que tous les paramètres commencent par ":" suivi d\'un nom valide');
console.log('2. Pas de caractères spéciaux après ":" sauf pour les paramètres optionnels (?)');
console.log('3. L\'ordre des routes est important - placez les routes spécifiques avant les génériques');
console.log('4. Exemple correct: router.get("/:id", handler)');
console.log('5. Exemple incorrect: router.get("/::", handler)\n');