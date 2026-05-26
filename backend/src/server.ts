import { createApp } from './app.js';
import { env } from './config/env.js';
import { getDatabase } from './db/connection.js';
import { initializeSchema } from './db/schema.js';
import { logger } from './utils/logger.js';

/**
 * @description Inicializa base de datos, crea la app Express y abre el puerto HTTP.
 * @why Existe como punto de entrada real del backend cuando ejecutamos desarrollo o produccion.
 * @returns No devuelve valor; mantiene el proceso escuchando requests.
 * @example npm run dev --workspace backend
 */
function startServer(): void {
  const db = getDatabase();
  initializeSchema(db);

  const app = createApp();

  app.listen(env.PORT, (): void => {
    logger.info('Servidor backend iniciado.', {
      port: env.PORT,
      nodeEnv: env.NODE_ENV,
    });
  });
}

startServer();

/**
 * Responsabilidades del archivo:
 * - Ejecutar el schema SQLite al arrancar.
 * - Crear la aplicacion Express.
 * - Publicar la API en el puerto configurado por entorno.
 */

