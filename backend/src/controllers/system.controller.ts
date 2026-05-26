import type { Request, Response } from 'express';
import { env } from '../config/env.js';

/**
 * @description Devuelve el estado publico de configuracion del sistema.
 * @why Existe para que la UI muestre si OpenAI esta configurado sin exponer secretos.
 * @param _req - Request Express sin datos requeridos.
 * @param res - Response Express usada para devolver el estado.
 * @returns No devuelve valor; responde JSON.
 * @example GET /api/system/status
 */
export function systemStatusController(_req: Request, res: Response): void {
  res.status(200).json({
    status: 'ok',
    openAiConfigured: env.OPENAI_API_KEY !== undefined && env.OPENAI_API_KEY.length > 0,
    chatModel: env.OPENAI_CHAT_MODEL,
    maxChunksContext: env.MAX_CHUNKS_CONTEXT,
    minSimilarityScore: env.MIN_SIMILARITY_SCORE,
    maxFileSizeMb: env.MAX_FILE_SIZE_MB,
  });
}

/**
 * Responsabilidades del archivo:
 * - Exponer estado operativo no sensible.
 * - Ayudar al frontend a diagnosticar configuracion.
 * - Mantener secretos fuera de respuestas HTTP.
 */

