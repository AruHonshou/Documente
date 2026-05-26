import type { NextFunction, Request, Response } from 'express';
import { verifyAccessToken } from '../services/auth.service.js';

/**
 * @middleware requireAuth
 * @description Valida el Bearer token y agrega el usuario autenticado a `req.user`.
 * @why Protege rutas privadas y asegura que los controllers sepan quien hace la request.
 * @flow req -> requireAuth -> controller protegido si el JWT es valido
 */
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const authorizationHeader = req.header('Authorization');

  if (authorizationHeader === undefined || !authorizationHeader.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Token de autenticacion requerido.' });
    return;
  }

  const token = authorizationHeader.slice('Bearer '.length);
  const user = verifyAccessToken(token);

  if (user === null) {
    res.status(401).json({ message: 'Token de autenticacion invalido o expirado.' });
    return;
  }

  req.user = user;
  next();
}

/**
 * Responsabilidades del archivo:
 * - Leer JWT desde el header Authorization.
 * - Rechazar requests no autenticadas.
 * - Compartir el usuario verificado con las siguientes capas.
 */

