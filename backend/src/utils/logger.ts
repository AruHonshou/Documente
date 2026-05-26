import winston from 'winston';
import { env } from '../config/env.js';

/**
 * @description Crea el logger central de la aplicacion con formato consistente.
 * @why Existe para que controllers, services y middlewares reporten eventos sin usar `console.log`.
 * @returns Instancia Winston configurada para desarrollo y produccion.
 * @example logger.info('Servidor iniciado');
 */
function createLogger(): winston.Logger {
  return winston.createLogger({
    level: env.NODE_ENV === 'production' ? 'info' : 'debug',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.errors({ stack: true }),
      winston.format.json(),
    ),
    transports: [new winston.transports.Console()],
  });
}

export const logger = createLogger();

/**
 * Responsabilidades del archivo:
 * - Centralizar logs estructurados.
 * - Permitir ajustar verbosidad por ambiente.
 * - Evitar logs dispersos y dificiles de filtrar.
 */

