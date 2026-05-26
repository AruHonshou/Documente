import { Router } from 'express';
import { systemStatusController } from '../controllers/system.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

export const systemRouter = Router();

systemRouter.get('/status', requireAuth, systemStatusController);

/**
 * Responsabilidades del archivo:
 * - Definir endpoints de estado del sistema.
 * - Proteger configuracion operativa detras de JWT.
 * - Mantener la logica fuera de rutas.
 */

