import rateLimit from 'express-rate-limit';

/**
 * @middleware publicRateLimiter
 * @description Limita requests publicas por IP durante una ventana corta.
 * @why Reduce abuso accidental o malicioso en endpoints generales de la API.
 * @flow req -> publicRateLimiter -> routes si no supera el limite
 */
export const publicRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * @middleware authRateLimiter
 * @description Aplica un limite mas estricto a login, register y refresh.
 * @why Protege endpoints sensibles contra fuerza bruta y abuso de credenciales.
 * @flow req -> authRateLimiter -> auth controller si no supera el limite
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Responsabilidades del archivo:
 * - Definir rate limiting reutilizable.
 * - Separar politicas generales y politicas sensibles de autenticacion.
 * - Exponer middlewares listos para rutas Express.
 */

