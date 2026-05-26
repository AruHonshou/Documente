export interface AuthenticatedUser {
  id: number;
  email: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: AuthenticatedUser;
  tokens: AuthTokens;
}

export interface JwtPayload {
  sub: string;
  email: string;
  tokenType: 'access' | 'refresh';
}

/**
 * Responsabilidades del archivo:
 * - Compartir tipos de autenticacion entre services, controllers y middleware.
 * - Evitar duplicar formas de datos en distintas capas.
 * - Mantener explicito que el password hash nunca sale hacia el cliente.
 */

