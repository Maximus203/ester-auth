import { NextFunction, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { UserModel } from '../models/user-model';

/**
 * Règles de validation pour la connexion
 */
export const loginValidationRules = () => {
 return [
  body('email')
   .isEmail()
   .withMessage('Veuillez saisir un email valide')
   .normalizeEmail(),
  body('password')
   .notEmpty()
   .withMessage('Le mot de passe est obligatoire'),
 ];
};

/**
 * Règles de validation pour l'inscription
 */
export const registerValidationRules = () => {
 return [
  body('firstName')
   .trim()
   .isLength({ min: 2, max: 50 })
   .withMessage('Le prénom doit contenir entre 2 et 50 caractères')
   .matches(/^[a-zA-ZÀ-ÿ\s\-']+$/)
   .withMessage('Le prénom ne doit contenir que des lettres, espaces, tirets et apostrophes'),

  body('lastName')
   .trim()
   .isLength({ min: 2, max: 50 })
   .withMessage('Le nom doit contenir entre 2 et 50 caractères')
   .matches(/^[a-zA-ZÀ-ÿ\s\-']+$/)
   .withMessage('Le nom ne doit contenir que des lettres, espaces, tirets et apostrophes'),

  body('email')
   .isEmail()
   .withMessage('Veuillez saisir un email valide')
   .normalizeEmail()
   .custom(async (email) => {
    const existingUser = await UserModel.findByEmail(email);
    if (existingUser) {
     throw new Error('Un compte avec cet email existe déjà');
    }
   }),

  body('password')
   .isLength({ min: 8 })
   .withMessage('Le mot de passe doit contenir au moins 8 caractères')
   .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])/)
   .withMessage('Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial'),

  body('confirmPassword')
   .custom((value, { req }) => {
    if (value !== req.body.password) {
     throw new Error('Les mots de passe ne correspondent pas');
    }
    return true;
   }),
 ];
};

/**
 * Middleware pour vérifier les résultats de validation
 */
export const validate = (req: Request, res: Response, next: NextFunction): void => {
 const errors = validationResult(req);

 if (!errors.isEmpty()) {
  const errorMessages = errors.array().map(error => ({
   field: error.type === 'field' ? error.path : 'unknown',
   message: error.msg,
  }));

  // Stocker les erreurs dans la session pour les afficher après redirection
  req.session.validationErrors = errorMessages;
  req.session.formData = req.body;

  // Rediriger vers la page précédente
  const referer = req.get('Referer') || '/';
  res.redirect(referer);
  return;
 }

 // Nettoyer les erreurs précédentes
 delete req.session.validationErrors;
 delete req.session.formData;

 next();
};

/**
 * Middleware pour ajouter les erreurs de validation aux templates
 */
export const addValidationLocals = (req: Request, res: Response, next: NextFunction): void => {
 res.locals.errors = req.session.validationErrors || [];
 res.locals.formData = req.session.formData || {};

 // Nettoyer après usage
 delete req.session.validationErrors;
 delete req.session.formData;

 next();
};

/**
 * Middleware pour ajouter les messages flash aux templates
 */
export const addFlashLocals = (req: Request, res: Response, next: NextFunction): void => {
 res.locals.successMessage = req.session.successMessage || null;
 res.locals.errorMessage = req.session.errorMessage || null;
 res.locals.infoMessage = req.session.infoMessage || null;

 // Nettoyer après usage
 delete req.session.successMessage;
 delete req.session.errorMessage;
 delete req.session.infoMessage;

 next();
};

// Extension des types de session pour les messages
declare module 'express-session' {
 interface SessionData {
  validationErrors?: Array<{ field: string; message: string }>;
  formData?: any;
  successMessage?: string;
  errorMessage?: string;
  infoMessage?: string;
 }
}
