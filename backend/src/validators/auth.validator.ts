import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    email: z.string().email('El email no tiene un formato valido.').toLowerCase(),
    password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres.'),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('El email no tiene un formato valido.').toLowerCase(),
    password: z.string().min(1, 'La contraseña es requerida.'),
  }),
});

export const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1, 'El refresh token es requerido.'),
  }),
});

export type RegisterInput = z.infer<typeof registerSchema>['body'];
export type LoginInput = z.infer<typeof loginSchema>['body'];
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>['body'];

/**
 * Responsabilidades del archivo:
 * - Validar inputs de autenticacion antes de llegar al service.
 * - Convertir email a minusculas para evitar duplicados logicos.
 * - Exportar tipos derivados de Zod para no duplicar interfaces.
 */
