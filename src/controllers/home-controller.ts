import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/error-middleware';
import { UserService } from '../services/user-service';

export class HomeController {

 /**
  * Afficher la page d'accueil publique
  */
 public static showHome = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  try {
   // Si l'utilisateur est connecté, rediriger vers le dashboard
   if (req.session?.isAuthenticated) {
    res.redirect('/dashboard');
    return;
   }

   // Récupérer quelques statistiques pour la page d'accueil
   const stats = await UserService.getUserStats();

   res.render('pages/home', {
    title: 'Accueil - Ester',
    meta: {
     description: 'Application d\'authentification moderne avec Express.js et TypeScript',
     keywords: 'authentification, express, typescript, sqlite',
    },
    stats: {
     totalUsers: stats.totalUsers,
     showStats: stats.totalUsers > 0,
    },
   });
  } catch (error) {
   console.error('Erreur lors de l\'affichage de la page d\'accueil:', error);

   // En cas d'erreur, afficher quand même la page d'accueil sans stats
   res.render('pages/home', {
    title: 'Accueil - Ester',
    meta: {
     description: 'Application d\'authentification moderne avec Express.js et TypeScript',
     keywords: 'authentification, express, typescript, sqlite',
    },
    stats: {
     totalUsers: 0,
     showStats: false,
    },
   });
  }
 });

 /**
  * Page À propos
  */
 public static showAbout = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  res.render('pages/about', {
   title: 'À propos - Ester',
   meta: {
    description: 'En savoir plus sur l\'application Ester',
    keywords: 'à propos, ester, authentification',
   },
  });
 });

 /**
  * API de statut pour le health check
  */
 public static getStatus = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  try {
   const stats = await UserService.getUserStats();

   res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    database: {
     connected: true,
     users: stats.totalUsers,
    },
    environment: process.env.NODE_ENV || 'development',
   });
  } catch (error) {
   res.status(500).json({
    status: 'ERROR',
    timestamp: new Date().toISOString(),
    message: 'Erreur de connexion à la base de données',
    environment: process.env.NODE_ENV || 'development',
   });
  }
 });
}
