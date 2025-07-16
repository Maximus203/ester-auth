import { UserModel } from '../models/user-model';
import { UpdateUserData, UserWithoutPassword } from '../types/user.types';
import { AuthService } from './auth-service';

export class UserService {

 /**
  * Récupérer un utilisateur par ID (sans mot de passe)
  */
 public static async getUserById(id: number): Promise<UserWithoutPassword | null> {
  try {
   return await UserModel.findByIdSafe(id);
  } catch (error) {
   console.error('Erreur lors de la récupération de l\'utilisateur:', error);
   throw new Error('Impossible de récupérer les informations utilisateur');
  }
 }

 /**
  * Mettre à jour le profil utilisateur
  */
 public static async updateProfile(
  userId: number,
  updateData: Omit<UpdateUserData, 'password'>
 ): Promise<UserWithoutPassword | null> {
  try {
   // Validation des données
   if (updateData.firstName) {
    const firstNameValidation = AuthService.validateName(updateData.firstName);
    if (!firstNameValidation.isValid) {
     throw new Error(firstNameValidation.errors[0]);
    }
   }

   if (updateData.lastName) {
    const lastNameValidation = AuthService.validateName(updateData.lastName);
    if (!lastNameValidation.isValid) {
     throw new Error(lastNameValidation.errors[0]);
    }
   }

   if (updateData.email) {
    if (!AuthService.validateEmail(updateData.email)) {
     throw new Error('Format d\'email invalide');
    }

    // Vérifier l'unicité de l'email
    const emailExists = await UserModel.emailExists(updateData.email, userId);
    if (emailExists) {
     throw new Error('Un compte avec cet email existe déjà');
    }
   }

   // Mettre à jour l'utilisateur
   await UserModel.update(userId, updateData);

   // Retourner l'utilisateur mis à jour
   return await this.getUserById(userId);

  } catch (error) {
   console.error('Erreur lors de la mise à jour du profil:', error);
   throw error;
  }
 }

 /**
  * Changer le mot de passe
  */
 public static async changePassword(
  userId: number,
  currentPassword: string,
  newPassword: string
 ): Promise<boolean> {
  try {
   // Récupérer l'utilisateur avec mot de passe
   const user = await UserModel.findById(userId);
   if (!user) {
    throw new Error('Utilisateur non trouvé');
   }

   // Vérifier le mot de passe actuel
   const isCurrentPasswordValid = await AuthService.verifyPassword(
    currentPassword,
    user.password
   );
   if (!isCurrentPasswordValid) {
    throw new Error('Mot de passe actuel incorrect');
   }

   // Valider le nouveau mot de passe
   const passwordValidation = AuthService.validatePasswordStrength(newPassword);
   if (!passwordValidation.isValid) {
    throw new Error(passwordValidation.errors[0]);
   }

   // Hacher le nouveau mot de passe
   const hashedNewPassword = await AuthService.hashPassword(newPassword);

   // Mettre à jour le mot de passe
   await UserModel.update(userId, { password: hashedNewPassword });

   return true;

  } catch (error) {
   console.error('Erreur lors du changement de mot de passe:', error);
   throw error;
  }
 }

 /**
  * Supprimer un compte utilisateur
  */
 public static async deleteAccount(userId: number): Promise<boolean> {
  try {
   return await UserModel.delete(userId);
  } catch (error) {
   console.error('Erreur lors de la suppression du compte:', error);
   throw new Error('Impossible de supprimer le compte');
  }
 }

 /**
  * Récupérer les statistiques utilisateur
  */
 public static async getUserStats(): Promise<{
  totalUsers: number;
  recentUsers: UserWithoutPassword[];
 }> {
  try {
   const totalUsers = await UserModel.count();
   const allUsers = await UserModel.findAll();

   // Convertir en UserWithoutPassword et prendre les 5 plus récents
   const recentUsers = allUsers
    .map(user => ({
     id: user.id,
     firstName: user.firstName,
     lastName: user.lastName,
     email: user.email,
     createdAt: user.createdAt,
     updatedAt: user.updatedAt,
    }))
    .slice(0, 5);

   return {
    totalUsers,
    recentUsers,
   };
  } catch (error) {
   console.error('Erreur lors de la récupération des statistiques:', error);
   throw new Error('Impossible de récupérer les statistiques');
  }
 }
}
