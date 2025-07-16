import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/error-middleware';
import { AuthService } from '../services/auth-service';
import { AuthRequest, AuthSession, RegisterRequest } from '../types/auth.types';

export class AuthController {

 /**
  * Afficher le formulaire de connexion
  */
 public static showLogin = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  // Récupérer le message depuis les query params
  const message = req.query.message as string;
  if (message) {
   req.session.infoMessage = message;
  }

  res.render('pages/login', {
   title: 'Connexion - Ester',
   meta: {
    description: 'Connectez-vous à votre compte Ester',
    keywords: 'connexion, login, authentification',
   },
  });
 });

 /**
  * Traiter la connexion
  */
 public static login = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const credentials: AuthRequest = {
   email: req.body.email,
   password: req.body.password,
  };

  try {
   const result = await AuthService.login(credentials);

   if (result.success && result.user) {
    // Créer la session utilisateur
    const userSession: AuthSession = {
     userId: result.user.id,
     firstName: result.user.firstName,
     lastName: result.user.lastName,
     email: result.user.email,
     isAuthenticated: true,
    };

    req.session.user = userSession;
    req.session.isAuthenticated = true;
    req.session.successMessage = `Bienvenue ${result.user.firstName} !`;

    // Rediriger vers le dashboard
    res.redirect('/dashboard');
   } else {
    // Échec de la connexion
    req.session.errorMessage = result.message ?? 'Erreur de connexion';
    res.redirect('/login');
   }
  } catch (error) {
   console.error('Erreur lors de la connexion:', error);
   req.session.errorMessage = 'Une erreur est survenue lors de la connexion';
   res.redirect('/login');
  }
 });

 /**
  * Afficher le formulaire d'inscription
  */
 public static showRegister = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  res.render('pages/register', {
   title: 'Inscription - Ester',
   meta: {
    description: 'Créez votre compte Ester gratuitement',
    keywords: 'inscription, register, créer compte',
   },
  });
 });

 /**
  * Traiter l'inscription
  */
 public static register = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userData: RegisterRequest = {
   firstName: req.body.firstName,
   lastName: req.body.lastName,
   email: req.body.email,
   password: req.body.password,
   confirmPassword: req.body.confirmPassword,
  };

  try {
   const result = await AuthService.register(userData);

   if (result.success && result.user) {
    // Créer automatiquement la session pour le nouvel utilisateur
    const userSession: AuthSession = {
     userId: result.user.id,
     firstName: result.user.firstName,
     lastName: result.user.lastName,
     email: result.user.email,
     isAuthenticated: true,
    };

    req.session.user = userSession;
    req.session.isAuthenticated = true;
    req.session.successMessage = `Bienvenue ${result.user.firstName} ! Votre compte a été créé avec succès.`;

    // Rediriger vers le dashboard
    res.redirect('/dashboard');
   } else {
    // Échec de l'inscription
    req.session.errorMessage = result.message ?? 'Erreur lors de l\'inscription';
    res.redirect('/register');
   }
  } catch (error) {
   console.error('Erreur lors de l\'inscription:', error);
   req.session.errorMessage = 'Une erreur est survenue lors de la création du compte';
   res.redirect('/register');
  }
 });

 /**
  * Déconnecter l'utilisateur
  */
 public static logout = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const firstName = req.session.user?.firstName;

  // Détruire la session
  req.session.destroy((err) => {
   if (err) {
    console.error('Erreur lors de la déconnexion:', err);
    res.redirect('/dashboard');
    return;
   }

   // Effacer le cookie de session
   res.clearCookie('connect.sid');

   // Rediriger vers l'accueil avec un message
   res.redirect(`/?message=${encodeURIComponent(`Au revoir ${firstName || ''} ! Vous avez été déconnecté avec succès.`)}`);
  });
 });

 /**
  * Vérifier le statut de l'authentification (API)
  */
 public static checkAuthStatus = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  if (req.session?.isAuthenticated && req.session?.user) {
   res.json({
    isAuthenticated: true,
    user: {
     id: req.session.user.userId,
     firstName: req.session.user.firstName,
     lastName: req.session.user.lastName,
     email: req.session.user.email,
    },
   });
  } else {
   res.json({
    isAuthenticated: false,
    user: null,
   });
  }
 });

 /**
  * Page de mot de passe oublié (placeholder)
  */
 public static showForgotPassword = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  res.render('pages/forgot-password', {
   title: 'Mot de passe oublié - Ester',
   meta: {
    description: 'Récupérez votre mot de passe',
    keywords: 'mot de passe oublié, reset password',
   },
  });
 });

 /**
  * Traiter la demande de récupération de mot de passe (placeholder)
  */
 public static processForgotPassword = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  // TODO: Implémenter la récupération de mot de passe par email
  req.session.infoMessage = 'Fonctionnalité en cours de développement. Contactez un administrateur.';
  res.redirect('/forgot-password');
 });
}
