/**
 * Script de test complet de l'application Ester
 * Tests automatisés pour valider toutes les fonctionnalités
 */

const http = require('http');
const https = require('https');

class EsterTester {
 constructor() {
  this.baseUrl = 'http://localhost:3000';
  this.testResults = [];
  this.sessionCookie = null;
 }

 // Utilitaire pour faire des requêtes HTTP
 async makeRequest(path, method = 'GET', data = null, headers = {}) {
  const maxRetries = 3;
  let lastError;

  for (let retry = 0; retry < maxRetries; retry++) {
   try {
    return await this._performRequest(path, method, data, headers);
   } catch (error) {
    lastError = error;
    if (retry < maxRetries - 1) {
     console.log(`Tentative ${retry + 1} échouée, retry dans 1s...`);
     await new Promise(resolve => setTimeout(resolve, 1000));
    }
   }
  }
  throw lastError;
 }

 async _performRequest(path, method = 'GET', data = null, headers = {}) {
  return new Promise((resolve, reject) => {
   const url = new URL(path, this.baseUrl);
   const options = {
    hostname: url.hostname,
    port: url.port,
    path: url.pathname + url.search,
    method: method,
    headers: {
     'User-Agent': 'Ester-Tester/1.0',
     ...headers
    }
   };

   if (this.sessionCookie) {
    options.headers['Cookie'] = this.sessionCookie;
   }

   if (data) {
    const postData = new URLSearchParams(data).toString();
    options.headers['Content-Type'] = 'application/x-www-form-urlencoded';
    options.headers['Content-Length'] = Buffer.byteLength(postData);
   }

   const req = http.request(options, (res) => {
    let responseData = '';
    res.on('data', (chunk) => {
     responseData += chunk;
    });
    res.on('end', () => {
     // Capturer les cookies de session
     if (res.headers['set-cookie']) {
      this.sessionCookie = res.headers['set-cookie'][0];
     }
     resolve({
      statusCode: res.statusCode,
      headers: res.headers,
      data: responseData
     });
    });
   });

   req.on('error', (err) => {
    reject(err);
   });

   if (data) {
    req.write(new URLSearchParams(data).toString());
   }

   req.end();
  });
 }

 // Test unitaire
 async test(name, testFunction) {
  console.log(`🧪 Test: ${name}`);
  try {
   await testFunction();
   console.log(`✅ PASS: ${name}`);
   this.testResults.push({ name, status: 'PASS' });
  } catch (error) {
   console.log(`❌ FAIL: ${name} - ${error.message}`);
   this.testResults.push({ name, status: 'FAIL', error: error.message });
  }
 }

 // Tests des pages principales
 async testMainPages() {
  await this.test('Page d\'accueil accessible', async () => {
   const response = await this.makeRequest('/');
   if (response.statusCode !== 200) {
    throw new Error(`Code de retour attendu: 200, reçu: ${response.statusCode}`);
   }
   if (!response.data.includes('Ester')) {
    throw new Error('Le titre "Ester" n\'est pas présent sur la page');
   }
  });

  await this.test('Page de connexion accessible', async () => {
   const response = await this.makeRequest('/login');
   if (response.statusCode !== 200) {
    throw new Error(`Code de retour attendu: 200, reçu: ${response.statusCode}`);
   }
   if (!response.data.includes('Connexion')) {
    throw new Error('Le formulaire de connexion n\'est pas présent');
   }
  });

  await this.test('Page d\'inscription accessible', async () => {
   const response = await this.makeRequest('/register');
   if (response.statusCode !== 200) {
    throw new Error(`Code de retour attendu: 200, reçu: ${response.statusCode}`);
   }
   if (!response.data.includes('Inscription')) {
    throw new Error('Le formulaire d\'inscription n\'est pas présent');
   }
  });

  await this.test('Dashboard protégé (redirection)', async () => {
   const response = await this.makeRequest('/dashboard');
   if (response.statusCode !== 302) {
    throw new Error(`Code de retour attendu: 302, reçu: ${response.statusCode}`);
   }
  });
 }  // Tests d'authentification
 async testAuthentication() {
  console.log(`\n📝 Début des tests d'authentification`);

  const testUser = {
   firstName: 'Test',
   lastName: 'User',
   email: `test${Date.now()}@example.com`,
   password: 'TestPassword123!'
  };

  await this.test('Inscription d\'un utilisateur', async () => {
   const response = await this.makeRequest('/register', 'POST', testUser);
   if (response.statusCode !== 302 && response.statusCode !== 200) {
    throw new Error(`Inscription échouée: ${response.statusCode}`);
   }
  });

  // Réinitialiser la session avant la connexion
  this.sessionCookie = null;

  await this.test('Connexion utilisateur', async () => {
   const loginData = {
    email: testUser.email,
    password: testUser.password
   };
   const response = await this.makeRequest('/login', 'POST', loginData);
   if (response.statusCode !== 302) {
    throw new Error(`Connexion échouée: ${response.statusCode}`);
   }

   // Vérifier que nous avons bien un cookie de session
   if (!this.sessionCookie) {
    throw new Error('Aucun cookie de session reçu après connexion');
   }
  });

  await this.test('Accès au dashboard après connexion', async () => {
   // Petite pause pour s'assurer que la session est active
   await new Promise(resolve => setTimeout(resolve, 100));

   const response = await this.makeRequest('/dashboard');
   if (response.statusCode !== 200) {
    throw new Error(`Dashboard inaccessible: ${response.statusCode}`);
   }
   if (!response.data.includes('Bonjour, Test')) {
    throw new Error('Dashboard ne montre pas le bon prénom utilisateur');
   }
  });

  await this.test('Déconnexion utilisateur', async () => {
   const response = await this.makeRequest('/logout', 'POST');
   if (response.statusCode !== 302) {
    throw new Error(`Déconnexion échouée: ${response.statusCode}`);
   }
  });
 }

 // Tests des ressources statiques
 async testStaticResources() {
  await this.test('CSS principal accessible', async () => {
   const response = await this.makeRequest('/css/main.css');
   if (response.statusCode !== 200) {
    throw new Error(`CSS non accessible: ${response.statusCode}`);
   }
  });

  await this.test('JavaScript principal accessible', async () => {
   const response = await this.makeRequest('/js/main.js');
   if (response.statusCode !== 200) {
    throw new Error(`JavaScript non accessible: ${response.statusCode}`);
   }
  });
 }

 // Tests de sécurité de base
 async testBasicSecurity() {
  await this.test('Headers de sécurité présents', async () => {
   const response = await this.makeRequest('/');
   const headers = response.headers;

   // Vérifier quelques headers de sécurité de base
   if (!headers['x-content-type-options']) {
    throw new Error('Header X-Content-Type-Options manquant');
   }
  });

  await this.test('Tentative d\'accès sans authentification', async () => {
   this.sessionCookie = null; // Reset session
   const response = await this.makeRequest('/dashboard');
   if (response.statusCode !== 302) {
    throw new Error('Dashboard accessible sans authentification');
   }
  });
 }

 // Tests de performance basiques
 async testPerformance() {
  await this.test('Temps de réponse page d\'accueil < 1s', async () => {
   const startTime = Date.now();
   await this.makeRequest('/');
   const responseTime = Date.now() - startTime;

   if (responseTime > 1000) {
    throw new Error(`Temps de réponse trop lent: ${responseTime}ms`);
   }
  });
 }

 // Exécuter tous les tests
 async runAllTests() {
  console.log('🚀 Début des tests de l\'application Ester\n');

  // Attendre que le serveur soit prêt
  console.log('🔍 Vérification de la disponibilité du serveur...');
  let serverReady = false;
  for (let i = 0; i < 10; i++) {
   try {
    await this._performRequest('/');
    serverReady = true;
    console.log('✅ Serveur disponible\n');
    break;
   } catch (error) {
    console.log(`⏳ Attente du serveur... (${i + 1}/10)`);
    await new Promise(resolve => setTimeout(resolve, 2000));
   }
  }

  if (!serverReady) {
   console.log('❌ Le serveur n\'est pas disponible après 20s');
   return;
  }

  await this.testMainPages();
  console.log('');

  await this.testStaticResources();
  console.log('');

  await this.testBasicSecurity();
  console.log('');

  await this.testPerformance();
  console.log('');

  await this.testAuthentication();
  console.log('');

  // Rapport final
  this.generateReport();
 }

 // Générer le rapport de tests
 generateReport() {
  console.log('📊 RAPPORT DE TESTS FINAL');
  console.log('=' * 50);

  const total = this.testResults.length;
  const passed = this.testResults.filter(t => t.status === 'PASS').length;
  const failed = this.testResults.filter(t => t.status === 'FAIL').length;

  console.log(`Total des tests: ${total}`);
  console.log(`✅ Réussis: ${passed}`);
  console.log(`❌ Échoués: ${failed}`);
  console.log(`📈 Taux de réussite: ${Math.round((passed / total) * 100)}%`);

  if (failed > 0) {
   console.log('\n❌ TESTS ÉCHOUÉS:');
   this.testResults
    .filter(t => t.status === 'FAIL')
    .forEach(test => {
     console.log(`  - ${test.name}: ${test.error}`);
    });
  }

  console.log('\n🎉 Tests terminés !');

  if (failed === 0) {
   console.log('✅ Toutes les fonctionnalités fonctionnent correctement !');
  } else {
   console.log('⚠️  Certains tests ont échoué. Vérifiez les erreurs ci-dessus.');
  }
 }
}

// Exécuter les tests si ce fichier est appelé directement
if (require.main === module) {
 const tester = new EsterTester();
 tester.runAllTests().catch(console.error);
}

module.exports = EsterTester;
