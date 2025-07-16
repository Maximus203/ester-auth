export interface AuthRequest {
 email: string;
 password: string;
}

export interface RegisterRequest {
 firstName: string;
 lastName: string;
 email: string;
 password: string;
 confirmPassword: string;
}

export interface AuthResult {
 success: boolean;
 user?: {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
 };
 message?: string;
 errors?: string[];
}

export interface ValidationError {
 field: string;
 message: string;
}

export interface AuthSession {
 userId: number;
 firstName: string;
 lastName: string;
 email: string;
 isAuthenticated: boolean;
}

// Extension des types de session Express
declare module 'express-session' {
 interface SessionData {
  user?: AuthSession;
  isAuthenticated?: boolean;
 }
}
