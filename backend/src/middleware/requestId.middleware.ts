import { randomUUID } from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';

declare global {
  namespace Express {
    interface Request {
      requestId?: string;
    }
  }
}

/**
 * @middleware requestIdMiddleware
 * @description Asigna un identificador unico a cada request y lo expone en `X-Request-Id`.
 * @why Necesitamos este middleware para correlacionar errores del frontend con logs del backend.
 * @flow req -> requestIdMiddleware -> siguiente middleware o controller
 */
export function requestIdMiddleware(req: Request, res: Response, next: NextFunction): void {
  const requestId = req.header('X-Request-Id') ?? randomUUID();

  req.requestId = requestId;
  res.setHeader('X-Request-Id', requestId);
  next();
}

/**
 * Responsabilidades del archivo:
 * - Crear trazabilidad por request.
 * - Exponer el id al cliente para diagnostico.
 * - Mantener el request id disponible en controllers y logs.
 */

