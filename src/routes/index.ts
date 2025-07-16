import { Router } from 'express';
import { HomeController } from '../controllers/home-controller';
import authRoutes from './auth-routes';
import dashboardRoutes from './dashboard-routes';

const router = Router();

// Routes principales
router.get('/', HomeController.showHome);
router.get('/about', HomeController.showAbout);

// API de statut simple
router.get('/api/status', HomeController.getStatus);
router.get('/health', (req, res) => {
 res.json({
  status: 'ok',
  timestamp: new Date().toISOString(),
  uptime: process.uptime(),
  environment: process.env.NODE_ENV || 'development'
 });
});

// Routes d'authentification
router.use('/', authRoutes);

// Routes du dashboard
router.use('/dashboard', dashboardRoutes);

export default router;
