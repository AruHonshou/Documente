import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config({ path: ['.env', '../.env'] });

const envSchema = z.object({
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_CHAT_MODEL: z.string().default('gpt-4o'),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET debe tener al menos 32 caracteres.'),
  JWT_EXPIRES_IN: z.string().default('1h'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  PORT: z.coerce.number().int().positive().default(3000),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  MAX_FILE_SIZE_MB: z.coerce.number().int().positive().default(10),
  MAX_CHUNKS_CONTEXT: z.coerce.number().int().positive().default(5),
  MIN_SIMILARITY_SCORE: z.coerce.number().min(-1).max(1).default(0.15),
  CHUNK_SIZE_TOKENS: z.coerce.number().int().positive().default(500),
  CHUNK_OVERLAP_TOKENS: z.coerce.number().int().nonnegative().default(50),
  CORS_ORIGIN: z.string().url().default('http://localhost:5173'),
  DATABASE_PATH: z.string().default('./data/database.sqlite'),
});

/**
 * @description Valida las variables de entorno antes de arrancar la API.
 * @why Existe para fallar temprano si falta configuracion critica como JWT_SECRET o puertos invalidos.
 * @returns Variables de entorno tipadas y listas para usar en el backend.
 * @example const port = env.PORT;
 */
function loadEnv(): z.infer<typeof envSchema> {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    throw new Error(`Variables de entorno invalidas: ${result.error.message}`);
  }

  return result.data;
}

export const env = loadEnv();

/**
 * Responsabilidades del archivo:
 * - Cargar `.env` durante desarrollo.
 * - Validar configuracion con Zod antes de ejecutar logica de negocio.
 * - Exponer un objeto `env` tipado para evitar strings magicos en el codigo.
 */
