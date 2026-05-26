import cors from 'cors';
import express, { type Express, type Request, type Response } from 'express';
import helmet from 'helmet';
import { env } from './config/env.js';
import { authRouter } from './routes/auth.routes.js';
import { chatRouter } from './routes/chat.routes.js';
import { documentRouter } from './routes/document.routes.js';
import { systemRouter } from './routes/system.routes.js';
import { publicRateLimiter } from './middleware/rateLimit.middleware.js';
import { requestIdMiddleware } from './middleware/requestId.middleware.js';

const allowedCorsOrigins = new Set<string>([
  env.CORS_ORIGIN,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
]);

/**
 * @description Verifica si el origen HTTP puede consumir la API.
 * @why Existe para permitir pruebas locales desde `localhost` o `127.0.0.1` aunque Vite cambie de puerto.
 * @param origin - Valor del header Origin enviado por el navegador.
 * @returns `true` si CORS debe permitir la request.
 * @example isAllowedCorsOrigin('http://127.0.0.1:5173');
 */
function isAllowedCorsOrigin(origin: string | undefined): boolean {
  if (origin === undefined || allowedCorsOrigins.has(origin)) {
    return true;
  }

  if (env.NODE_ENV !== 'development') {
    return false;
  }

  try {
    const parsedOrigin = new URL(origin);
    const isLocalHost = parsedOrigin.hostname === 'localhost' || parsedOrigin.hostname === '127.0.0.1';

    return parsedOrigin.protocol === 'http:' && isLocalHost;
  } catch {
    return false;
  }
}

/**
 * @description Construye la aplicacion Express con middlewares base y rutas.
 * @why Existe separado del servidor HTTP para poder testear la app sin abrir un puerto.
 * @returns Instancia Express lista para escuchar requests.
 * @example const app = createApp();
 */
export function createApp(): Express {
  const app = express();

  app.use(requestIdMiddleware);
  app.use(helmet());
  app.use(cors({
    origin: (origin, callback): void => {
      if (isAllowedCorsOrigin(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error('CORS_ORIGIN_NOT_ALLOWED'));
    },
  }));
  app.use(express.json({ limit: '1mb' }));
  app.use(publicRateLimiter);

  app.get('/api/health', (_req: Request, res: Response): void => {
    res.status(200).json({ status: 'ok' });
  });

  app.use('/api/auth', authRouter);
  app.use('/api/chat', chatRouter);
  app.use('/api/documents', documentRouter);
  app.use('/api/system', systemRouter);

  return app;
}

/**
 * Responsabilidades del archivo:
 * - Configurar seguridad base con Helmet y CORS.
 * - Registrar parseo JSON y rate limiting publico.
 * - Montar rutas versionadas bajo `/api` para auth y documentos.
 * - Permitir origenes locales equivalentes durante desarrollo.
 */
