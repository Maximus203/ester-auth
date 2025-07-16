import bcrypt from 'bcrypt';
import { UserModel } from '../models/user-model';
import { AuthRequest, AuthResult, RegisterRequest } from '../types/auth.types';
import { CreateUserData } from '../types/user.types';

const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12');

export class AuthService {

 /**
  * Hacher un mot de passe
  */
 public static async hashPassword(password: string): Promise<string> {
  try {
   return await bcrypt.hash(password, SALT_ROUNDS);
  } catch (error) {
   throw new Error(`Erreur lors du hachage du mot de passe: ${error}`);
  }
 }

 /**
  * Vérifier un mot de passe
  */
 public static async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  try {
   return await bcrypt.compare(password, hashedPassword);
  } catch (error) {
   throw new Error(`Erreur lors de la vérification du mot de passe: ${error}`);
  }
 }

 /**
  * Authentifier un utilisateur
  */
 public static async login(credentials: AuthRequest): Promise<AuthResult> {
  const { email, password } = credentials;

  try {
   // Chercher l'utilisateur par email
   const user = await UserModel.findByEmail(email);
   if (!user) {
    console.log("Utilisateur non trouvé pour l'email:", email);

    return {
     success: false,
     message: 'Email ou mot de passe incorrect',
    };
   }

   // Vérifier le mot de passe
   const isPasswordValid = await this.verifyPassword(password, user.password);
   console.log('Mot de passe vérifié pour l\'utilisateur:', email);
   if (!isPasswordValid) {
    console.log('Mot de passe incorrect pour l\'utilisateur:', email);
    return {
     success: false,
     message: 'Email ou mot de passe incorrect',
    };
   }

   // Authentification réussie
   return {
    success: true,
    user: {
     id: user.id,
     firstName: user.firstName,
     lastName: user.lastName,
     email: user.email,
    },
    message: 'Connexion réussie',
   };

  } catch (error) {
   console.error('Erreur lors de l\'authentification:', error);
   return {
    success: false,
    message: 'Erreur interne du serveur',
   };
  }
 }

 /**
  * Enregistrer un nouvel utilisateur
  */
 public static async register(userData: RegisterRequest): Promise<AuthResult> {
  const { firstName, lastName, email, password, confirmPassword } = userData;

  try {
   // Validation des mots de passe
   if (password !== confirmPassword) {
    return {
     success: false,
     message: 'Les mots de passe ne correspondent pas',
    };
   }

   // Vérifier si l'email existe déjà
   const existingUser = await UserModel.findByEmail(email);
   if (existingUser) {
    return {
     success: false,
     message: 'Un compte avec cet email existe déjà',
    };
   }

   // Hacher le mot de passe
   const hashedPassword = await this.hashPassword(password);

   // Créer l'utilisateur
   const createUserData: CreateUserData = {
    firstName,
    lastName,
    email,
    password: hashedPassword,
   };

   const newUser = await UserModel.create(createUserData);

   return {
    success: true,
    user: {
     id: newUser.id,
     firstName: newUser.firstName,
     lastName: newUser.lastName,
     email: newUser.email,
    },
    message: 'Compte créé avec succès',
   };

  } catch (error) {
   console.error('Erreur lors de l\'enregistrement:', error);
   return {
    success: false,
    message: 'Erreur lors de la création du compte',
   };
  }
 }

 /**
  * Valider la force d'un mot de passe
  */
 public static validatePasswordStrength(password: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (password.length < 8) {
   errors.push('Le mot de passe doit contenir au moins 8 caractères');
  }

  if (!/[A-Z]/.test(password)) {
   errors.push('Le mot de passe doit contenir au moins une majuscule');
  }

  if (!/[a-z]/.test(password)) {
   errors.push('Le mot de passe doit contenir au moins une minuscule');
  }

  if (!/\d/.test(password)) {
   errors.push('Le mot de passe doit contenir au moins un chiffre');
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
   errors.push('Le mot de passe doit contenir au moins un caractère spécial');
  }

  return {
   isValid: errors.length === 0,
   errors,
  };
 }

 /**
  * Valider un email
  */
 public static validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
 }

 /**
  * Valider un nom (prénom ou nom de famille)
  */
 public static validateName(name: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!name || name.trim().length === 0) {
   errors.push('Ce champ est obligatoire');
  } else if (name.trim().length < 2) {
   errors.push('Doit contenir au moins 2 caractères');
  } else if (name.trim().length > 50) {
   errors.push('Doit contenir au maximum 50 caractères');
  } else if (!/^[a-zA-ZÀ-ÿ\s\-']+$/.test(name.trim())) {
   errors.push('Ne doit contenir que des lettres, espaces, tirets et apostrophes');
  }

  return {
   isValid: errors.length === 0,
   errors,
  };
 }
}
