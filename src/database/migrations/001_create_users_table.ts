import database from '../connection';

export const createUsersTable = async (): Promise<void> => {
 const sql = `
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      firstName VARCHAR(50) NOT NULL,
      lastName VARCHAR(50) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `;

 try {
  await database.run(sql);
  console.log('✅ Table users créée avec succès');

  // Créer un index sur l'email pour optimiser les recherches
  const indexSql = `
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)
    `;
  await database.run(indexSql);
  console.log('✅ Index sur email créé avec succès');

  // Créer un trigger pour mettre à jour updatedAt automatiquement
  const triggerSql = `
      CREATE TRIGGER IF NOT EXISTS update_users_timestamp 
      AFTER UPDATE ON users
      BEGIN
        UPDATE users SET updatedAt = CURRENT_TIMESTAMP WHERE id = NEW.id;
      END
    `;
  await database.run(triggerSql);
  console.log('✅ Trigger de mise à jour timestamp créé avec succès');

 } catch (error) {
  console.error('❌ Erreur lors de la création de la table users:', error);
  throw error;
 }
};

export const dropUsersTable = async (): Promise<void> => {
 try {
  await database.run('DROP TABLE IF EXISTS users');
  console.log('✅ Table users supprimée avec succès');
 } catch (error) {
  console.error('❌ Erreur lors de la suppression de la table users:', error);
  throw error;
 }
};
