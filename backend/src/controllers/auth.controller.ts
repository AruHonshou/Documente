import type { Request, Response } from 'express';
import { loginUser, refreshAuthTokens, registerUser } from '../services/auth.service.js';
import type { LoginInput, RefreshTokenInput, RegisterInput } from '../validators/auth.validator.js';

/**
 * @description Registra un usuario nuevo y responde con tokens JWT.
 * @why Existe para traducir una request HTTP en una llamada al servicio de autenticacion.
 * @param req - Request Express con body validado por Zod.
 * @param res - Response Express usada para enviar status y JSON.
 * @returns Promesa sin valor; responde al cliente directamente.
 * @example POST /api/auth/register
 */
export async function registerController(req: Request, res: Response): Promise<void> {
  try {
    const input = req.body as RegisterInput;
    const authResponse = await registerUser(input);

    res.status(201).json(authResponse);
  } catch (error) {
    if (error instanceof Error && error.message === 'EMAIL_ALREADY_REGISTERED') {
      res.status(409).json({ message: 'El email ya esta registrado.' });
      return;
    }

    res.status(500).json({ message: 'No se pudo registrar el usuario.' });
  }
}

/**
 * @description Inicia sesion con email/password y responde con tokens JWT.
 * @why Existe para mantener la capa HTTP separada de la validacion de credenciales.
 * @param req - Request Express con body validado por Zod.
 * @param res - Response Express usada para enviar status y JSON.
 * @returns Promesa sin valor; responde al cliente directamente.
 * @example POST /api/auth/login
 */
export async function loginController(req: Request, res: Response): Promise<void> {
  try {
    const input = req.body as LoginInput;
    const authResponse = await loginUser(input);

    res.status(200).json(authResponse);
  } catch (error) {
    if (error instanceof Error && error.message === 'INVALID_CREDENTIALS') {
      res.status(401).json({ message: 'Credenciales invalidas.' });
      return;
    }

    res.status(500).json({ message: 'No se pudo iniciar sesion.' });
  }
}

/**
 * @description Renueva access y refresh token usando un refresh token valido.
 * @why Existe para extender sesiones sin volver a pedir email/password.
 * @param req - Request Express con refreshToken validado por Zod.
 * @param res - Response Express usada para enviar status y JSON.
 * @returns No devuelve valor; responde al cliente directamente.
 * @example POST /api/auth/refresh
 */
export function refreshController(req: Request, res: Response): void {
  try {
    const input = req.body as RefreshTokenInput;
    const authResponse = refreshAuthTokens(input.refreshToken);

    res.status(200).json(authResponse);
  } catch {
    res.status(401).json({ message: 'Refresh token invalido o expirado.' });
  }
}

/**
 * @description Devuelve el usuario autenticado presente en `req.user`.
 * @why Existe para que el frontend pueda restaurar sesion despues de recargar la pagina.
 * @param req - Request Express enriquecida por `requireAuth`.
 * @param res - Response Express usada para enviar el usuario actual.
 * @returns No devuelve valor; responde al cliente directamente.
 * @example GET /api/auth/me
 */
export function meController(req: Request, res: Response): void {
  res.status(200).json({ user: req.user });
}

/**
 * Responsabilidades del archivo:
 * - Orquestar requests HTTP de autenticacion.
 * - Delegar logica sensible al service.
 * - Convertir errores de dominio en status HTTP claros.
 */
