/**
 * Configuration du système de logging pour l'application Ester
 */

import path from 'path';
import winston from 'winston';

const logDir = path.join(process.cwd(), 'logs');

// Configuration des niveaux de log
const logLevels = {
 error: 0,
 warn: 1,
 info: 2,
 http: 3,
 debug: 4
};

// Configuration des couleurs pour la console
const logColors = {
 error: 'red',
 warn: 'yellow',
 info: 'green',
 http: 'magenta',
 debug: 'blue'
};

winston.addColors(logColors);

// Format pour les logs
const logFormat = winston.format.combine(
 winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
 winston.format.errors({ stack: true }),
 winston.format.json()
);

// Format pour la console en développement
const consoleFormat = winston.format.combine(
 winston.format.colorize({ all: true }),
 winston.format.timestamp({ format: 'HH:mm:ss' }),
 winston.format.printf(({ timestamp, level, message, stack }) => {
  return `${timestamp} [${level}]: ${stack || message}`;
 })
);

// Configuration du logger principal
const logger = winston.createLogger({
 level: process.env.LOG_LEVEL || 'info',
 levels: logLevels,
 format: logFormat,
 transports: [
  // Logs d'erreur dans un fichier séparé
  new winston.transports.File({
   filename: path.join(logDir, 'error.log'),
   level: 'error',
   maxsize: 5242880, // 5MB
   maxFiles: 5
  }),

  // Tous les logs dans un fichier général
  new winston.transports.File({
   filename: path.join(logDir, 'app.log'),
   maxsize: 5242880, // 5MB
   maxFiles: 10
  })
 ],

 // Gestion des exceptions non capturées
 exceptionHandlers: [
  new winston.transports.File({
   filename: path.join(logDir, 'exceptions.log')
  })
 ],

 // Gestion des rejections non capturées
 rejectionHandlers: [
  new winston.transports.File({
   filename: path.join(logDir, 'rejections.log')
  })
 ]
});

// Ajouter la console en développement
if (process.env.NODE_ENV !== 'production') {
 logger.add(new winston.transports.Console({
  format: consoleFormat
 }));
}

// Middleware pour logger les requêtes HTTP
export const httpLogger = (req: any, res: any, next: any) => {
 const start = Date.now();

 res.on('finish', () => {
  const duration = Date.now() - start;
  const logData = {
   method: req.method,
   url: req.url,
   status: res.statusCode,
   duration: `${duration}ms`,
   userAgent: req.get('User-Agent'),
   ip: req.ip
  };

  if (res.statusCode >= 400) {
   logger.warn('HTTP Request', logData);
  } else {
   logger.http('HTTP Request', logData);
  }
 });

 next();
};

// Types de logs pour l'application
export const AppLogger = {
 // Logs d'authentification
 auth: {
  loginSuccess: (email: string, ip: string) => {
   logger.info('User login successful', { email, ip, type: 'auth' });
  },
  loginFailed: (email: string, ip: string, reason: string) => {
   logger.warn('User login failed', { email, ip, reason, type: 'auth' });
  },
  registerSuccess: (email: string, ip: string) => {
   logger.info('User registration successful', { email, ip, type: 'auth' });
  },
  logoutSuccess: (email: string, ip: string) => {
   logger.info('User logout successful', { email, ip, type: 'auth' });
  }
 },

 // Logs de sécurité
 security: {
  rateLimitExceeded: (ip: string, endpoint: string) => {
   logger.warn('Rate limit exceeded', { ip, endpoint, type: 'security' });
  },
  suspiciousActivity: (ip: string, activity: string) => {
   logger.warn('Suspicious activity detected', { ip, activity, type: 'security' });
  }
 },

 // Logs de base de données
 database: {
  connectionSuccess: () => {
   logger.info('Database connection established', { type: 'database' });
  },
  connectionError: (error: Error) => {
   logger.error('Database connection failed', { error: error.message, type: 'database' });
  },
  queryError: (query: string, error: Error) => {
   logger.error('Database query failed', { query, error: error.message, type: 'database' });
  }
 },

 // Logs généraux
 info: (message: string, meta?: any) => logger.info(message, meta),
 warn: (message: string, meta?: any) => logger.warn(message, meta),
 error: (message: string, error?: Error, meta?: any) => {
  logger.error(message, { error: error?.message, stack: error?.stack, ...meta });
 },
 debug: (message: string, meta?: any) => logger.debug(message, meta)
};

export default logger;
