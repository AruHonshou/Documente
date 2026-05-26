import { z } from 'zod';

export const createSessionSchema = z.object({
  body: z.object({
    documentId: z.number().int().positive(),
    title: z.string().min(1).max(120).optional(),
  }),
});

export const askQuestionSchema = z.object({
  body: z.object({
    documentId: z.number().int().positive(),
    sessionId: z.number().int().positive().optional(),
    question: z.string().min(1).max(4000),
  }),
});

export const sessionParamsSchema = z.object({
  params: z.object({
    sessionId: z.coerce.number().int().positive(),
  }),
});

export type CreateSessionInput = z.infer<typeof createSessionSchema>['body'];
export type AskQuestionInput = z.infer<typeof askQuestionSchema>['body'];

/**
 * Responsabilidades del archivo:
 * - Validar inputs de sesiones y preguntas de chat.
 * - Convertir params URL a numeros cuando corresponde.
 * - Exportar tipos derivados para controllers sin duplicar contratos.
 */

