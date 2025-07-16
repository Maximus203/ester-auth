import { createUsersTable } from './migrations/001_create_users_table';

interface Migration {
 id: number;
 name: string;
 up: () => Promise<void>;
}

const migrations: Migration[] = [
 {
  id: 1,
  name: 'create_users_table',
  up: createUsersTable,
 },
];

export const runMigrations = async (): Promise<void> => {
 console.log('🚀 Démarrage des migrations...');

 try {
  for (const migration of migrations) {
   console.log(`📋 Exécution de la migration: ${migration.name}`);
   await migration.up();
  }
  console.log('✅ Toutes les migrations ont été exécutées avec succès');
 } catch (error) {
  console.error('❌ Erreur lors de l\'exécution des migrations:', error);
  throw error;
 }
};

// Script pour exécuter les migrations
if (require.main === module) {
 runMigrations()
  .then(() => {
   console.log('🎉 Migrations terminées');
   process.exit(0);
  })
  .catch((error) => {
   console.error('💥 Échec des migrations:', error);
   process.exit(1);
  });
}
