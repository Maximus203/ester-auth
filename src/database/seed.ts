import bcrypt from 'bcrypt';
import { UserModel } from '../models/user-model';

const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12');

export const seedUsers = async (): Promise<void> => {
 console.log('🌱 Ajout des données de test...');

 try {
  // Vérifier si des utilisateurs existent déjà
  const userCount = await UserModel.count();
  if (userCount > 0) {
   console.log('⚠️  Des utilisateurs existent déjà, suppression des seeds...');
   return;
  }

  // Utilisateurs de test
  const testUsers = [
   {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    password: 'Password123!',
   },
   {
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane.smith@example.com',
    password: 'SecurePass456!',
   },
   {
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@ester.com',
    password: 'AdminPassword789!',
   },
  ];

  for (const userData of testUsers) {
   // Hacher le mot de passe
   const hashedPassword = await bcrypt.hash(userData.password, SALT_ROUNDS);

   // Créer l'utilisateur
   const user = await UserModel.create({
    ...userData,
    password: hashedPassword,
   });

   console.log(`✅ Utilisateur créé: ${user.firstName} ${user.lastName} (${user.email})`);
  }

  console.log('🎉 Données de test ajoutées avec succès');

 } catch (error) {
  console.error('❌ Erreur lors de l\'ajout des données de test:', error);
  throw error;
 }
};

// Script pour exécuter les seeds
if (require.main === module) {
 seedUsers()
  .then(() => {
   console.log('🌱 Seeds terminés');
   process.exit(0);
  })
  .catch((error) => {
   console.error('💥 Échec des seeds:', error);
   process.exit(1);
  });
}
