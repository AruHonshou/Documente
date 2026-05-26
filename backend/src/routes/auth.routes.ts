import { Router } from 'express';
import { loginController, meController, refreshController, registerController } from '../controllers/auth.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { authRateLimiter } from '../middleware/rateLimit.middleware.js';
import { validateRequest } from '../middleware/validate.middleware.js';
import { loginSchema, refreshTokenSchema, registerSchema } from '../validators/auth.validator.js';

export const authRouter = Router();

authRouter.post('/register', authRateLimiter, validateRequest(registerSchema), registerController);
authRouter.post('/login', authRateLimiter, validateRequest(loginSchema), loginController);
authRouter.post('/refresh', authRateLimiter, validateRequest(refreshTokenSchema), refreshController);
authRouter.get('/me', requireAuth, meController);

/**
 * Responsabilidades del archivo:
 * - Definir endpoints de autenticacion sin logica de negocio.
 * - Conectar validadores, rate limit y controllers en orden.
 * - Mantener rutas protegidas detras de `requireAuth`.
 */

