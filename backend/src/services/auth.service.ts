import bcrypt from 'bcrypt';
import jwt, { type Secret, type SignOptions } from 'jsonwebtoken';
import { getDatabase } from '../db/connection.js';
import { env } from '../config/env.js';
import type { AuthenticatedUser, AuthResponse, AuthTokens, JwtPayload } from '../types/auth.types.js';
import type { LoginInput, RegisterInput } from '../validators/auth.validator.js';

interface UserRecord {
  id: number;
  email: string;
  password_hash: string;
}

const passwordSaltRounds = 12;

/**
 * @description Crea un usuario nuevo con password hasheado y devuelve tokens JWT.
 * @why Existe para encapsular la regla critica de nunca guardar contraseñas en texto plano.
 * @param input - Email y password validados por Zod desde el controller.
 * @returns Usuario publico y tokens de acceso/refresco.
 * @example const auth = await registerUser({ email, password });
 */
export async function registerUser(input: RegisterInput): Promise<AuthResponse> {
  const db = getDatabase();
  const existingUser = findUserByEmail(input.email);

  if (existingUser !== null) {
    throw new Error('EMAIL_ALREADY_REGISTERED');
  }

  const passwordHash = await bcrypt.hash(input.password, passwordSaltRounds);
  const insertUser = db.prepare('INSERT INTO users (email, password_hash) VALUES (?, ?)');
  const result = insertUser.run(input.email, passwordHash);
  const user: AuthenticatedUser = {
    id: Number(result.lastInsertRowid),
    email: input.email,
  };

  return {
    user,
    tokens: createTokenPair(user),
  };
}

/**
 * @description Autentica un usuario existente comparando su password con bcrypt.
 * @why Existe para centralizar la logica de login y evitar filtrar si fallo email o password.
 * @param input - Credenciales validadas por Zod desde el controller.
 * @returns Usuario publico y tokens nuevos si las credenciales son correctas.
 * @example const auth = await loginUser({ email, password });
 */
export async function loginUser(input: LoginInput): Promise<AuthResponse> {
  const userRecord = findUserByEmail(input.email);

  if (userRecord === null) {
    throw new Error('INVALID_CREDENTIALS');
  }

  const passwordMatches = await bcrypt.compare(input.password, userRecord.password_hash);

  if (!passwordMatches) {
    throw new Error('INVALID_CREDENTIALS');
  }

  const user: AuthenticatedUser = {
    id: userRecord.id,
    email: userRecord.email,
  };

  return {
    user,
    tokens: createTokenPair(user),
  };
}

/**
 * @description Valida un refresh token y emite un nuevo par de tokens.
 * @why Existe para renovar sesiones sin pedir la contraseña en cada expiracion del access token.
 * @param refreshToken - JWT de refresco enviado por el cliente.
 * @returns Usuario publico y tokens nuevos.
 * @example const auth = refreshAuthTokens(refreshToken);
 */
export function refreshAuthTokens(refreshToken: string): AuthResponse {
  const payload = verifyToken(refreshToken, 'refresh');

  if (payload === null) {
    throw new Error('INVALID_REFRESH_TOKEN');
  }

  const userRecord = findUserById(Number(payload.sub));

  if (userRecord === null) {
    throw new Error('INVALID_REFRESH_TOKEN');
  }

  const user: AuthenticatedUser = {
    id: userRecord.id,
    email: userRecord.email,
  };

  return {
    user,
    tokens: createTokenPair(user),
  };
}

/**
 * @description Verifica un access token y devuelve el usuario autenticado.
 * @why Existe para que el middleware de autenticacion no conozca detalles de JWT.
 * @param token - JWT enviado en el header Authorization.
 * @returns Usuario autenticado o null si el token no es valido.
 * @example const user = verifyAccessToken(token);
 */
export function verifyAccessToken(token: string): AuthenticatedUser | null {
  const payload = verifyToken(token, 'access');

  if (payload === null) {
    return null;
  }

  return {
    id: Number(payload.sub),
    email: payload.email,
  };
}

/**
 * @description Busca un usuario por email usando una query parametrizada.
 * @why Existe para reutilizar una consulta segura y evitar concatenar SQL manualmente.
 * @param email - Email normalizado del usuario.
 * @returns Registro completo del usuario o null si no existe.
 * @example const user = findUserByEmail('demo@example.com');
 */
function findUserByEmail(email: string): UserRecord | null {
  const db = getDatabase();
  const statement = db.prepare('SELECT id, email, password_hash FROM users WHERE email = ?');
  const user = statement.get(email) as UserRecord | undefined;

  return user ?? null;
}

/**
 * @description Busca un usuario por id usando una query parametrizada.
 * @why Existe para validar que un refresh token pertenece a un usuario todavia existente.
 * @param id - Identificador numerico del usuario.
 * @returns Registro completo del usuario o null si no existe.
 * @example const user = findUserById(1);
 */
function findUserById(id: number): UserRecord | null {
  const db = getDatabase();
  const statement = db.prepare('SELECT id, email, password_hash FROM users WHERE id = ?');
  const user = statement.get(id) as UserRecord | undefined;

  return user ?? null;
}

/**
 * @description Genera access token y refresh token para un usuario autenticado.
 * @why Existe para mantener una sola politica de expiracion y payload de JWT.
 * @param user - Usuario publico que se codificara dentro del JWT.
 * @returns Par de tokens firmados.
 * @example const tokens = createTokenPair(user);
 */
function createTokenPair(user: AuthenticatedUser): AuthTokens {
  return {
    accessToken: signToken(user, 'access', env.JWT_EXPIRES_IN as NonNullable<SignOptions['expiresIn']>),
    refreshToken: signToken(user, 'refresh', env.JWT_REFRESH_EXPIRES_IN as NonNullable<SignOptions['expiresIn']>),
  };
}

/**
 * @description Firma un JWT con tipo de token explicito.
 * @why Existe para diferenciar access tokens de refresh tokens y evitar uso cruzado.
 * @param user - Usuario que sera representado por el token.
 * @param tokenType - Tipo logico del token: access o refresh.
 * @param expiresIn - Duracion configurada por variables de entorno.
 * @returns JWT firmado como string.
 * @example const token = signToken(user, 'access', '1h');
 */
function signToken(
  user: AuthenticatedUser,
  tokenType: JwtPayload['tokenType'],
  expiresIn: NonNullable<SignOptions['expiresIn']>,
): string {
  const payload: Omit<JwtPayload, 'sub'> = {
    email: user.email,
    tokenType,
  };

  const options: SignOptions = {
    subject: String(user.id),
    expiresIn,
  };

  return jwt.sign(payload, env.JWT_SECRET as Secret, options);
}

/**
 * @description Verifica firma, expiracion y tipo esperado de un JWT.
 * @why Existe para evitar aceptar refresh tokens en rutas protegidas o access tokens en renovacion.
 * @param token - JWT recibido desde el cliente.
 * @param expectedType - Tipo de token que se espera en este flujo.
 * @returns Payload validado o null si algo no coincide.
 * @example const payload = verifyToken(token, 'access');
 */
function verifyToken(token: string, expectedType: JwtPayload['tokenType']): JwtPayload | null {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;

    if (decoded.tokenType !== expectedType) {
      return null;
    }

    return decoded;
  } catch {
    return null;
  }
}

/**
 * Responsabilidades del archivo:
 * - Registrar usuarios con bcrypt.
 * - Autenticar credenciales sin exponer detalles sensibles.
 * - Emitir y verificar JWT de acceso y refresco.
 * - Usar queries parametrizadas contra SQLite.
 */
