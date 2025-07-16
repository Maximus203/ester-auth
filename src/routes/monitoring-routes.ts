/**
 * Routes de monitoring et santé de l'application
 */

import { Request, Response, Router } from 'express';
import { readFileSync } from 'fs';
import { join } from 'path';
import { AppLogger } from '../utils/logger';

const router = Router();

// Interface pour les métriques de santé
interface HealthCheck {
 status: 'healthy' | 'unhealthy';
 timestamp: string;
 version: string;
 uptime: number;
 environment: string;
 database: 'connected' | 'disconnected';
 memory: {
  used: number;
  total: number;
  percentage: number;
 };
 services: {
  [key: string]: 'up' | 'down';
 };
}

/**
 * Route de vérification de santé de l'application
 */
router.get('/health', async (req: Request, res: Response) => {
 try {
  const packageJson = JSON.parse(
   readFileSync(join(process.cwd(), 'package.json'), 'utf8')
  );

  const memoryUsage = process.memoryUsage();
  const totalMemory = memoryUsage.heapTotal;
  const usedMemory = memoryUsage.heapUsed;

  const healthCheck: HealthCheck = {
   status: 'healthy',
   timestamp: new Date().toISOString(),
   version: packageJson.version,
   uptime: Math.floor(process.uptime()),
   environment: process.env.NODE_ENV || 'development',
   database: 'connected', // TODO: Vérifier la connexion réelle
   memory: {
    used: Math.floor(usedMemory / 1024 / 1024), // MB
    total: Math.floor(totalMemory / 1024 / 1024), // MB
    percentage: Math.floor((usedMemory / totalMemory) * 100)
   },
   services: {
    authentication: 'up',
    session: 'up',
    database: 'up',
    static_files: 'up'
   }
  };

  // Vérifier si l'application est saine
  if (healthCheck.memory.percentage > 90) {
   healthCheck.status = 'unhealthy';
   healthCheck.services.memory = 'down';
  }

  const statusCode = healthCheck.status === 'healthy' ? 200 : 503;

  AppLogger.info('Health check performed', {
   status: healthCheck.status,
   memory: healthCheck.memory,
   uptime: healthCheck.uptime
  });

  res.status(statusCode).json(healthCheck);

 } catch (error) {
  AppLogger.error('Health check failed', error instanceof Error ? error : new Error(String(error)));

  res.status(503).json({
   status: 'unhealthy',
   timestamp: new Date().toISOString(),
   error: 'Health check failed'
  });
 }
});

/**
 * Route pour les métriques détaillées (pour monitoring)
 */
router.get('/metrics', (req: Request, res: Response) => {
 const metrics = {
  timestamp: new Date().toISOString(),
  uptime: process.uptime(),
  memory: process.memoryUsage(),
  cpu: process.cpuUsage(),
  platform: process.platform,
  nodeVersion: process.version,
  pid: process.pid,
  environment: process.env.NODE_ENV,
  activeHandles: (process as any)._getActiveHandles?.()?.length || 0,
  activeRequests: (process as any)._getActiveRequests?.()?.length || 0
 };

 res.json(metrics);
});

/**
 * Route de status simple (pour load balancers)
 */
router.get('/status', (req: Request, res: Response) => {
 res.status(200).json({
  status: 'ok',
  timestamp: new Date().toISOString()
 });
});

/**
 * Route d'information sur l'application
 */
router.get('/info', (req: Request, res: Response) => {
 try {
  const packageJson = JSON.parse(
   readFileSync(join(process.cwd(), 'package.json'), 'utf8')
  );

  const info = {
   name: packageJson.name,
   version: packageJson.version,
   description: packageJson.description,
   author: packageJson.author,
   environment: process.env.NODE_ENV || 'development',
   nodeVersion: process.version,
   startTime: new Date(Date.now() - process.uptime() * 1000).toISOString(),
   uptime: {
    seconds: Math.floor(process.uptime()),
    human: formatUptime(process.uptime())
   }
  };

  res.json(info);

 } catch (error) {
  AppLogger.error('Failed to get app info', error instanceof Error ? error : new Error(String(error)));
  res.status(500).json({ error: 'Failed to get application info' });
 }
});

/**
 * Formater le temps de fonctionnement en format lisible
 */
function formatUptime(seconds: number): string {
 const days = Math.floor(seconds / 86400);
 const hours = Math.floor((seconds % 86400) / 3600);
 const minutes = Math.floor((seconds % 3600) / 60);
 const secs = Math.floor(seconds % 60);

 const parts = [];
 if (days > 0) parts.push(`${days}d`);
 if (hours > 0) parts.push(`${hours}h`);
 if (minutes > 0) parts.push(`${minutes}m`);
 if (secs > 0) parts.push(`${secs}s`);

 return parts.join(' ') || '0s';
}

export default router;
