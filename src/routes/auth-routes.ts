import { Router } from 'express';
import { AuthController } from '../controllers/auth-controller';
import { redirectIfAuthenticated } from '../middleware/auth-middleware';
import { loginValidationRules, registerValidationRules, validate } from '../middleware/validation-middleware';

const router = Router();

// Routes publiques (redirection si déjà connecté)
router.get('/login', redirectIfAuthenticated, AuthController.showLogin);
router.post('/login', redirectIfAuthenticated, loginValidationRules(), validate, AuthController.login);

router.get('/register', redirectIfAuthenticated, AuthController.showRegister);
router.post('/register', redirectIfAuthenticated, registerValidationRules(), validate, AuthController.register);

router.get('/forgot-password', redirectIfAuthenticated, AuthController.showForgotPassword);
router.post('/forgot-password', redirectIfAuthenticated, AuthController.processForgotPassword);

// Routes de déconnexion (accessible seulement si connecté)
router.post('/logout', AuthController.logout);
router.get('/logout', AuthController.logout);

// API Routes
router.get('/api/auth/status', AuthController.checkAuthStatus);

export default router;
