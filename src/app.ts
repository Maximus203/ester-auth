import dotenv from 'dotenv';
import express from 'express';
import rateLimit from 'express-rate-limit';
import session from 'express-session';
import helmet from 'helmet';
import path from 'path';
import { addAuthLocals, checkAuth } from './middleware/auth-middleware';
import { errorHandler, notFoundHandler } from './middleware/error-middleware';
import { addFlashLocals, addValidationLocals } from './middleware/validation-middleware';

// Charger les variables d'environnement
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Configuration de sécurité
app.use(helmet({
 contentSecurityPolicy: {
  directives: {
   defaultSrc: ["'self'"],
   styleSrc: ["'self'", "'unsafe-inline'"],
   scriptSrc: ["'self'"],
   imgSrc: ["'self'", "data:", "https:"],
  },
 },
}));

// Rate limiting global
const limiter = rateLimit({
 windowMs: 15 * 60 * 1000, // 15 minutes
 max: 100, // limite chaque IP à 100 requêtes par windowMs
 message: 'Trop de requêtes depuis cette IP, veuillez réessayer plus tard.',
 standardHeaders: true,
 legacyHeaders: false,
});
app.use(limiter);

// Rate limiting spécifique pour l'authentification
const authLimiter = rateLimit({
 windowMs: 15 * 60 * 1000, // 15 minutes
 max: 5, // limite chaque IP à 5 tentatives de connexion par windowMs
 message: 'Trop de tentatives de connexion, veuillez réessayer plus tard.',
 skipSuccessfulRequests: true,
});

// Appliquer le rate limiting auth aux routes sensibles
app.use('/login', authLimiter);
app.use('/register', authLimiter);

// Configuration des sessions
app.use(
 session({
  secret: process.env.SESSION_SECRET || 'development-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
   secure: process.env.NODE_ENV === 'production',
   httpOnly: true,
   maxAge: 24 * 60 * 60 * 1000, // 24 heures
  },
 })
);

// Configuration du moteur de template
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware pour les fichiers statiques
app.use(express.static(path.join(__dirname, 'public')));

// Middleware pour parser les données des formulaires
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Middlewares personnalisés
app.use(checkAuth);
app.use(addAuthLocals);
app.use(addValidationLocals);
app.use(addFlashLocals);

// Configuration des routes
import routes from './routes';
app.use('/', routes);

// Middleware de gestion d'erreurs
app.use(notFoundHandler);
app.use(errorHandler);

// Démarrage du serveur
app.listen(PORT, () => {
 console.log(`🚀 Serveur Ester démarré sur http://localhost:${PORT}`);
 console.log(`📂 Mode: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
