// deep-diagnostic.js - Diagnostic approfondi pour trouver le vrai problème

const fs = require('fs');
const path = require('path');

console.log('🔍 DIAGNOSTIC APPROFONDI\n');

// Fonction pour analyser tous les fichiers JavaScript
function analyzeAllJSFiles(dir, level = 0) {
  const indent = '  '.repeat(level);
  
  try {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory() && !file.startsWith('node_modules') && !file.startsWith('.')) {
        console.log(`${indent}📁 ${file}/`);
        analyzeAllJSFiles(filePath, level + 1);
      } else if (file.endsWith('.js')) {
        console.log(`${indent}📄 ${file}`);
        analyzeJSFile(filePath, level + 1);
      }
    });
  } catch (error) {
    console.log(`${indent}❌ Erreur lecture dossier ${dir}: ${error.message}`);
  }
}

function analyzeJSFile(filePath, level = 0) {
  const indent = '  '.repeat(level);
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    let hasRouteDefinitions = false;
    let problematicLines = [];
    
    lines.forEach((line, index) => {
      const lineNum = index + 1;
      
      // Chercher les définitions de routes Express
      const routeMatch = line.match(/router\.(get|post|put|delete|patch|use)\s*\(\s*['"`]([^'"`]*?)['"`]/);
      const appRouteMatch = line.match(/app\.(get|post|put|delete|patch|use)\s*\(\s*['"`]([^'"`]*?)['"`]/);
      
      if (routeMatch || appRouteMatch) {
        hasRouteDefinitions = true;
        const match = routeMatch || appRouteMatch;
        const method = match[1].toUpperCase();
        const route = match[2];
        
        // Vérifications spécifiques
        const problems = [];
        
        if (route.includes('::')) problems.push('Deux points doubles');
        if (route.match(/:[^a-zA-Z0-9_]/)) problems.push('Caractère invalide après :');
        if (route.includes('*:') || route.includes(':*')) problems.push('Wildcard mal placé');
        if (route.match(/:\s/) || route.match(/:\)/) || route.match(/:\}/) || route.match(/:\]/) || route.match(/:\|/)) {
          problems.push('Paramètre mal terminé');
        }
        if (route === ':' || route.startsWith('/:)') || route.includes('/:/')) {
          problems.push('Paramètre vide ou malformé');
        }
        
        if (problems.length > 0) {
          problematicLines.push({
            line: lineNum,
            route: route,
            method: method,
            problems: problems,
            fullLine: line.trim()
          });
        }
      }
      
      // Chercher d'autres patterns problématiques
      if (line.includes('path-to-regexp') || line.includes('pathToRegexp')) {
        problematicLines.push({
          line: lineNum,
          route: 'N/A',
          method: 'IMPORT',
          problems: ['Utilisation directe de path-to-regexp'],
          fullLine: line.trim()
        });
      }
      
      // Chercher des caractères bizarres dans les strings de route
      const stringMatches = line.match(/['"`]([^'"`]*\/[^'"`]*)['"`]/g);
      if (stringMatches) {
        stringMatches.forEach(match => {
          const str = match.slice(1, -1); // Enlever les guillemets
          if (str.includes('/') && str.match(/[^\w\-_\.\/:\*\?]/)) {
            problematicLines.push({
              line: lineNum,
              route: str,
              method: 'STRING',
              problems: ['Caractères spéciaux suspects dans la route'],
              fullLine: line.trim()
            });
          }
        });
      }
    });
    
    if (problematicLines.length > 0) {
      console.log(`${indent}❌ PROBLÈMES DÉTECTÉS:`);
      problematicLines.forEach(prob => {
        console.log(`${indent}  Ligne ${prob.line}: ${prob.method} "${prob.route}"`);
        console.log(`${indent}    Problèmes: ${prob.problems.join(', ')}`);
        console.log(`${indent}    Code: ${prob.fullLine}`);
      });
    } else if (hasRouteDefinitions) {
      console.log(`${indent}✅ Routes OK`);
    }
    
  } catch (error) {
    console.log(`${indent}❌ Erreur lecture ${filePath}: ${error.message}`);
  }
}

// Analyser spécifiquement les fichiers suspects
console.log('1. 🎯 ANALYSE DES FICHIERS PRINCIPAUX:\n');

const suspiciousFiles = [
  './index.js',
  './app.js',
  './socket/socket.js',
  './routes',
  './controllers',
  './middlewares'
];

suspiciousFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`📋 Analyse de ${file}:`);
    if (fs.statSync(file).isDirectory()) {
      analyzeAllJSFiles(file, 1);
    } else {
      analyzeJSFile(file, 1);
    }
    console.log();
  } else {
    console.log(`❌ ${file} non trouvé\n`);
  }
});

// Chercher des patterns spécifiques dans package.json et autres
console.log('\n2. 🔍 VÉRIFICATION DES DÉPENDANCES:\n');

try {
  const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
  console.log('📦 Versions importantes:');
  
  const importantDeps = ['express', 'socket.io', 'path-to-regexp'];
  importantDeps.forEach(dep => {
    const version = packageJson.dependencies?.[dep] || packageJson.devDependencies?.[dep];
    if (version) {
      console.log(`  ${dep}: ${version}`);
    }
  });
  
} catch (error) {
  console.log('❌ Erreur lecture package.json:', error.message);
}

console.log('\n3. 🎯 RECHERCHE DANS TOUS LES FICHIERS JS:\n');
analyzeAllJSFiles('./', 0);

console.log('\n✅ Diagnostic terminé');
console.log('\n🔧 SOLUTION SUGGÉRÉE:');
console.log('Si aucun problème n\'est détecté ci-dessus, le problème vient probablement de:');
console.log('1. Une version incompatible de path-to-regexp');
console.log('2. Un caractère invisible/encodage dans un fichier');
console.log('3. Un problème dans socket/socket.js');
console.log('\nExécutez: npm ls path-to-regexp pour voir la version installée');