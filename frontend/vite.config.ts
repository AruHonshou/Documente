import { defineConfig, type UserConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * @description Define la configuracion de Vite para compilar y servir la aplicacion React.
 * @why Existe para centralizar el pipeline del frontend: React, TypeScript y servidor de desarrollo.
 * @returns Un objeto de configuracion que Vite usa durante desarrollo y build.
 * @example Vite lo carga automaticamente al ejecutar `npm run dev` dentro de `frontend`.
 */
const config: UserConfig = defineConfig({
  base: process.env.VITE_BASE_PATH ?? '/',
  plugins: [react()],
  server: {
    port: 5173,
  },
});

export default config;

/**
 * Responsabilidades del archivo:
 * - Activar el plugin oficial de React para Vite.
 * - Ajustar el base path para despliegues estaticos como GitHub Pages.
 * - Fijar el puerto de desarrollo esperado por CORS.
 * - Mantener la configuracion del frontend en un unico punto.
 */

