import type { NextFunction, Request, Response } from 'express';
import type { ZodSchema } from 'zod';

/**
 * @middleware validateRequest
 * @description Intercepta requests y valida body, params o query contra un schema Zod.
 * @why Necesitamos este middleware para bloquear datos invalidos antes de ejecutar logica de negocio.
 * @flow req -> validateRequest(schema) -> controller si el input es valido
 */
export function validateRequest(schema: ZodSchema): (req: Request, res: Response, next: NextFunction) => void {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse({
      body: req.body,
      params: req.params,
      query: req.query,
    });

    if (!result.success) {
      res.status(400).json({
        message: 'Input invalido.',
        issues: result.error.flatten(),
      });
      return;
    }

    req.body = result.data.body ?? req.body;
    req.params = result.data.params ?? req.params;
    req.query = result.data.query ?? req.query;

    next();
  };
}

/**
 * Responsabilidades del archivo:
 * - Reutilizar validaciones Zod en cualquier ruta.
 * - Mantener controllers enfocados en orquestacion, no en parsing manual.
 * - Devolver errores de validacion consistentes al frontend.
 */

