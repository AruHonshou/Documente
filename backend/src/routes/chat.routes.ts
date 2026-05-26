import { Router } from 'express';
import {
  askQuestionController,
  askQuestionStreamController,
  createSessionController,
  listMessagesController,
  listSessionsController,
} from '../controllers/chat.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { validateRequest } from '../middleware/validate.middleware.js';
import { askQuestionSchema, createSessionSchema, sessionParamsSchema } from '../validators/chat.validator.js';

export const chatRouter = Router();

chatRouter.get('/sessions', requireAuth, listSessionsController);
chatRouter.post('/sessions', requireAuth, validateRequest(createSessionSchema), createSessionController);
chatRouter.get('/sessions/:sessionId/messages', requireAuth, validateRequest(sessionParamsSchema), listMessagesController);
chatRouter.post('/ask', requireAuth, validateRequest(askQuestionSchema), askQuestionController);
chatRouter.post('/ask/stream', requireAuth, validateRequest(askQuestionSchema), askQuestionStreamController);

/**
 * Responsabilidades del archivo:
 * - Definir endpoints de chat sin logica de negocio.
 * - Aplicar JWT y Zod antes de controllers.
 * - Separar sesiones, mensajes y preguntas del modulo de documentos.
 */
