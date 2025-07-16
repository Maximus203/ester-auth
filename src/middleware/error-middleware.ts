import { NextFunction, Request, Response } from 'express';

/**
 * Interface pour les erreurs personnalisées
 */
export interface AppError extends Error {
 statusCode?: number;
 isOperational?: boolean;
}

/**
 * Créer une erreur personnalisée
 */
export const createError = (message: string, statusCode: number = 500): AppError => {
 const error: AppError = new Error(message);
 error.statusCode = statusCode;
 error.isOperational = true;
 return error;
};

/**
 * Middleware pour les routes non trouvées (404)
 */
export const notFoundHandler = (req: Request, res: Response, next: NextFunction): void => {
 const error = createError(`Route non trouvée: ${req.originalUrl}`, 404);
 next(error);
};

/**
 * Middleware de gestion d'erreurs global
 */
export const errorHandler = (
 error: AppError,
 req: Request,
 res: Response,
 next: NextFunction
): void => {
 // Log de l'erreur
 console.error('Erreur:', {
  message: error.message,
  stack: error.stack,
  url: req.url,
  method: req.method,
  ip: req.ip,
  userAgent: req.get('User-Agent'),
 });

 // Déterminer le code de statut
 const statusCode = error.statusCode || 500;

 // Message d'erreur pour l'utilisateur
 let message = error.message;
 if (statusCode === 500 && process.env.NODE_ENV === 'production') {
  message = 'Une erreur interne s\'est produite';
 }

 // Si c'est une requête AJAX, retourner du JSON
 if (req.xhr || req.get('Content-Type') === 'application/json') {
  res.status(statusCode).json({
   success: false,
   message,
   ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
  });
  return;
 }

 // Pour les requêtes normales, afficher une page d'erreur
 res.status(statusCode);

 // Essayer de rendre la page d'erreur
 try {
  res.render('pages/error', {
   title: `Erreur ${statusCode}`,
   statusCode,
   message,
   showStack: process.env.NODE_ENV === 'development',
   stack: error.stack,
  });
 } catch (renderError) {
  // Si le rendu échoue, envoyer une réponse HTML simple
  console.error('Erreur lors du rendu de la page d\'erreur:', renderError);
  res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Erreur ${statusCode}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 2rem; }
            .error-container { max-width: 600px; margin: 0 auto; }
            .error-code { color: #e74c3c; font-size: 2rem; font-weight: bold; }
            .error-message { color: #2c3e50; margin: 1rem 0; }
            .back-link { color: #3498db; text-decoration: none; }
            .back-link:hover { text-decoration: underline; }
          </style>
        </head>
        <body>
          <div class="error-container">
            <div class="error-code">Erreur ${statusCode}</div>
            <div class="error-message">${message}</div>
            <a href="/" class="back-link">← Retour à l'accueil</a>
          </div>
        </body>
      </html>
    `);
 }
};

/**
 * Wrapper pour les fonctions async dans les routes
 */
export const asyncHandler = (
 fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
 return (req: Request, res: Response, next: NextFunction): void => {
  Promise.resolve(fn(req, res, next)).catch(next);
 };
};
