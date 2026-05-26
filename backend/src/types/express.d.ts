import type { AuthenticatedUser } from './auth.types.js';

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export {};

/**
 * Responsabilidades del archivo:
 * - Extender el tipo Request de Express con `req.user`.
 * - Permitir que el middleware de autenticacion comparta usuario con controllers.
 * - Mantener TypeScript estricto sin usar `any`.
 */

