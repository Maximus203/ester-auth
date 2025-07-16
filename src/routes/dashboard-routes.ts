import { Router } from 'express';
import { body } from 'express-validator';
import { DashboardController } from '../controllers/dashboard-controller';
import { requireAuth } from '../middleware/auth-middleware';
import { validate } from '../middleware/validation-middleware';

const router = Router();

// Toutes les routes du dashboard nécessitent une authentification
router.use(requireAuth);

// Dashboard principal
router.get('/', DashboardController.showDashboard);

// Gestion du profil
router.get('/profile', DashboardController.showProfile);
router.post('/profile', [
 body('firstName')
  .optional()
  .trim()
  .isLength({ min: 2, max: 50 })
  .withMessage('Le prénom doit contenir entre 2 et 50 caractères')
  .matches(/^[a-zA-ZÀ-ÿ\s\-']+$/)
  .withMessage('Le prénom ne doit contenir que des lettres, espaces, tirets et apostrophes'),

 body('lastName')
  .optional()
  .trim()
  .isLength({ min: 2, max: 50 })
  .withMessage('Le nom doit contenir entre 2 et 50 caractères')
  .matches(/^[a-zA-ZÀ-ÿ\s\-']+$/)
  .withMessage('Le nom ne doit contenir que des lettres, espaces, tirets et apostrophes'),

 body('email')
  .optional()
  .isEmail()
  .withMessage('Veuillez saisir un email valide')
  .normalizeEmail(),
], validate, DashboardController.updateProfile);

// Changement de mot de passe
router.get('/change-password', DashboardController.showChangePassword);
router.post('/change-password', [
 body('currentPassword')
  .notEmpty()
  .withMessage('Le mot de passe actuel est obligatoire'),

 body('newPassword')
  .isLength({ min: 8 })
  .withMessage('Le nouveau mot de passe doit contenir au moins 8 caractères')
  .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])/)
  .withMessage('Le nouveau mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial'),

 body('confirmPassword')
  .custom((value, { req }) => {
   if (value !== req.body.newPassword) {
    throw new Error('Les mots de passe ne correspondent pas');
   }
   return true;
  }),
], validate, DashboardController.changePassword);

// Suppression de compte
router.get('/delete-account', DashboardController.showDeleteAccount);
router.post('/delete-account', [
 body('confirmPassword')
  .notEmpty()
  .withMessage('Veuillez confirmer votre mot de passe'),

 body('confirmation')
  .equals('DELETE')
  .withMessage('Veuillez taper "DELETE" pour confirmer la suppression'),
], validate, DashboardController.deleteAccount);

// API Routes pour le dashboard
router.get('/api/time', DashboardController.getCurrentTime);

export default router;
