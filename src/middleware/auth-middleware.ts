import { NextFunction, Request, Response } from 'express';
import { AuthSession } from '../types/auth.types';

// Extension des types Express pour inclure l'utilisateur
declare global {
 namespace Express {
  interface Request {
   user?: AuthSession;
  }
 }
}

/**
 * Middleware pour vérifier l'authentification
 */
export const requireAuth = (req: Request, res: Response, next: NextFunction): void => {
 if (req.session?.isAuthenticated && req.session?.user) {
  // Ajouter l'utilisateur à la requête pour un accès facile
  req.user = req.session.user;
  next();
 } else {
  // Rediriger vers la page de connexion
  res.redirect('/login?message=Vous devez être connecté pour accéder à cette page');
 }
};

/**
 * Middleware pour rediriger les utilisateurs connectés
 */
export const redirectIfAuthenticated = (req: Request, res: Response, next: NextFunction): void => {
 if (req.session?.isAuthenticated) {
  res.redirect('/dashboard');
 } else {
  next();
 }
};

/**
 * Middleware pour vérifier si l'utilisateur est connecté (sans redirection)
 */
export const checkAuth = (req: Request, res: Response, next: NextFunction): void => {
 if (req.session?.isAuthenticated && req.session?.user) {
  req.user = req.session.user;
 }
 next();
};

/**
 * Middleware pour ajouter les variables locales d'authentification aux templates
 */
export const addAuthLocals = (req: Request, res: Response, next: NextFunction): void => {
 res.locals.isAuthenticated = req.session?.isAuthenticated || false;
 res.locals.user = req.session?.user || null;
 next();
};
