import { runMigrations } from './migrate';
import { dropUsersTable } from './migrations/001_create_users_table';
import { seedUsers } from './seed';

export const resetDatabase = async (): Promise<void> => {
 console.log('🔄 Réinitialisation de la base de données...');

 try {
  // 1. Supprimer les tables existantes
  console.log('🗑️  Suppression des tables existantes...');
  await dropUsersTable();

  // 2. Recréer les tables via les migrations
  console.log('📋 Recréation des tables...');
  await runMigrations();

  // 3. Ajouter les données de test
  console.log('🌱 Ajout des données de test...');
  await seedUsers();

  console.log('✅ Base de données réinitialisée avec succès');

 } catch (error) {
  console.error('❌ Erreur lors de la réinitialisation de la base de données:', error);
  throw error;
 }
};

// Script pour exécuter le reset
if (require.main === module) {
 resetDatabase()
  .then(() => {
   console.log('🎉 Reset terminé');
   process.exit(0);
  })
  .catch((error) => {
   console.error('💥 Échec du reset:', error);
   process.exit(1);
  });
}
