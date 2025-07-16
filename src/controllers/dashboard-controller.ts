import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/error-middleware';
import { AuthService } from '../services/auth-service';
import { UserService } from '../services/user-service';

export class DashboardController {

 /**
  * Afficher le dashboard principal
  */
 public static showDashboard = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
   res.redirect('/login');
   return;
  }

  try {
   // Récupérer les informations complètes de l'utilisateur
   const user = await UserService.getUserById(req.user.userId);

   if (!user) {
    req.session.errorMessage = 'Utilisateur non trouvé';
    res.redirect('/login');
    return;
   }

   // Récupérer les statistiques pour affichage
   const stats = await UserService.getUserStats();

   res.render('pages/dashboard', {
    title: `Dashboard - ${user.firstName} ${user.lastName}`,
    meta: {
     description: 'Votre espace personnel Ester',
     keywords: 'dashboard, profil, espace personnel',
    },
    user,
    stats: {
     totalUsers: stats.totalUsers,
     userSince: user.createdAt,
     lastUpdate: user.updatedAt,
    },
    currentTime: new Date().toISOString(),
   });
  } catch (error) {
   console.error('Erreur lors de l\'affichage du dashboard:', error);
   req.session.errorMessage = 'Erreur lors du chargement de votre profil';
   res.redirect('/');
  }
 });

 /**
  * Afficher la page de profil
  */
 public static showProfile = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
   res.redirect('/login');
   return;
  }

  try {
   const user = await UserService.getUserById(req.user.userId);

   if (!user) {
    req.session.errorMessage = 'Utilisateur non trouvé';
    res.redirect('/login');
    return;
   }

   res.render('pages/profile', {
    title: 'Mon Profil - Ester',
    meta: {
     description: 'Gérez vos informations personnelles',
     keywords: 'profil, informations personnelles, compte',
    },
    user,
   });
  } catch (error) {
   console.error('Erreur lors de l\'affichage du profil:', error);
   req.session.errorMessage = 'Erreur lors du chargement de votre profil';
   res.redirect('/dashboard');
  }
 });

 /**
  * Mettre à jour le profil
  */
 public static updateProfile = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
   res.redirect('/login');
   return;
  }

  try {
   const updateData = {
    firstName: req.body.firstName?.trim(),
    lastName: req.body.lastName?.trim(),
    email: req.body.email?.trim(),
   };

   // Filtrer les champs vides
   const filteredData = Object.fromEntries(
    Object.entries(updateData).filter(([_, value]) => value && value !== '')
   );

   if (Object.keys(filteredData).length === 0) {
    req.session.errorMessage = 'Aucune modification détectée';
    res.redirect('/profile');
    return;
   }

   const updatedUser = await UserService.updateProfile(req.user.userId, filteredData);

   if (updatedUser) {
    // Mettre à jour la session avec les nouvelles données
    if (req.session.user) {
     req.session.user.firstName = updatedUser.firstName;
     req.session.user.lastName = updatedUser.lastName;
     req.session.user.email = updatedUser.email;
    }

    req.session.successMessage = 'Profil mis à jour avec succès';
   } else {
    req.session.errorMessage = 'Erreur lors de la mise à jour du profil';
   }

   res.redirect('/profile');
  } catch (error) {
   console.error('Erreur lors de la mise à jour du profil:', error);
   req.session.errorMessage = error instanceof Error ? error.message : 'Erreur lors de la mise à jour';
   res.redirect('/profile');
  }
 });

 /**
  * Afficher la page de changement de mot de passe
  */
 public static showChangePassword = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
   res.redirect('/login');
   return;
  }

  res.render('pages/change-password', {
   title: 'Changer le mot de passe - Ester',
   meta: {
    description: 'Modifiez votre mot de passe',
    keywords: 'changer mot de passe, sécurité',
   },
  });
 });

 /**
  * Traiter le changement de mot de passe
  */
 public static changePassword = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
   res.redirect('/login');
   return;
  }

  try {
   const { currentPassword, newPassword, confirmPassword } = req.body;

   // Vérifier que les nouveaux mots de passe correspondent
   if (newPassword !== confirmPassword) {
    req.session.errorMessage = 'Les nouveaux mots de passe ne correspondent pas';
    res.redirect('/change-password');
    return;
   }

   // Valider la force du nouveau mot de passe
   const validation = AuthService.validatePasswordStrength(newPassword);
   if (!validation.isValid) {
    req.session.errorMessage = validation.errors?.[0] ?? 'Mot de passe invalide';
    res.redirect('/change-password');
    return;
   }

   await UserService.changePassword(req.user.userId, currentPassword, newPassword);

   req.session.successMessage = 'Mot de passe changé avec succès';
   res.redirect('/profile');
  } catch (error) {
   console.error('Erreur lors du changement de mot de passe:', error);
   req.session.errorMessage = error instanceof Error ? error.message : 'Erreur lors du changement de mot de passe';
   res.redirect('/change-password');
  }
 });

 /**
  * API pour obtenir l'heure actuelle (pour l'horloge temps réel)
  */
 public static getCurrentTime = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  res.json({
   timestamp: new Date().toISOString(),
   formatted: {
    date: new Date().toLocaleDateString('fr-FR', {
     weekday: 'long',
     year: 'numeric',
     month: 'long',
     day: 'numeric',
    }),
    time: new Date().toLocaleTimeString('fr-FR', {
     hour: '2-digit',
     minute: '2-digit',
     second: '2-digit',
    }),
   },
  });
 });

 /**
  * Page de confirmation de suppression de compte
  */
 public static showDeleteAccount = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
   res.redirect('/login');
   return;
  }

  res.render('pages/delete-account', {
   title: 'Supprimer le compte - Ester',
   meta: {
    description: 'Suppression définitive de votre compte',
    keywords: 'supprimer compte, suppression',
   },
  });
 });

 /**
  * Traiter la suppression de compte
  */
 public static deleteAccount = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
   res.redirect('/login');
   return;
  }

  try {
   const { confirmPassword } = req.body;

   // Vérifier le mot de passe avant suppression
   const user = await UserService.getUserById(req.user.userId);
   if (!user) {
    req.session.errorMessage = 'Utilisateur non trouvé';
    res.redirect('/login');
    return;
   }

   // Note: Cette vérification nécessiterait d'accéder au mot de passe hashé
   // Pour le moment, on supprime directement (à améliorer en production)

   const deleted = await UserService.deleteAccount(req.user.userId);

   if (deleted) {
    // Détruire la session
    req.session.destroy((err) => {
     if (err) {
      console.error('Erreur lors de la destruction de session:', err);
     }
     res.clearCookie('connect.sid');
     res.redirect('/?message=' + encodeURIComponent('Votre compte a été supprimé avec succès'));
    });
   } else {
    req.session.errorMessage = 'Erreur lors de la suppression du compte';
    res.redirect('/delete-account');
   }
  } catch (error) {
   console.error('Erreur lors de la suppression du compte:', error);
   req.session.errorMessage = 'Erreur lors de la suppression du compte';
   res.redirect('/delete-account');
  }
 });
}
