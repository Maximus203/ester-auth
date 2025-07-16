/**
 * Test manuel simple pour vérifier l'authentification
 */

async function testManualAuth() {
 console.log('🧪 Test manuel d\'authentification...\n');

 // Test 1: Créer un utilisateur de test via l'interface
 console.log('1. Testez manuellement dans le navigateur:');
 console.log('   - Allez sur http://localhost:3000/register');
 console.log('   - Créez un compte avec:');
 console.log('     • Prénom: Test');
 console.log('     • Nom: User');
 console.log('     • Email: test@example.com');
 console.log('     • Mot de passe: TestPassword123!');
 console.log('');

 console.log('2. Après inscription:');
 console.log('   - Vous devriez être redirigé vers le dashboard');
 console.log('   - Le dashboard devrait afficher "Bonjour, Test !"');
 console.log('   - L\'horloge devrait fonctionner en temps réel');
 console.log('');

 console.log('3. Test de déconnexion:');
 console.log('   - Cliquez sur "Se déconnecter" dans le menu');
 console.log('   - Vous devriez être redirigé vers la page d\'accueil');
 console.log('');

 console.log('4. Test de reconnexion:');
 console.log('   - Allez sur http://localhost:3000/login');
 console.log('   - Connectez-vous avec test@example.com / TestPassword123!');
 console.log('   - Vous devriez accéder au dashboard');
 console.log('');

 console.log('✅ Si tous ces tests fonctionnent, l\'application est opérationnelle !');
}

testManualAuth();
