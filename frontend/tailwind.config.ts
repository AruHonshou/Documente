import type { Config } from 'tailwindcss';

/**
 * @description Define donde TailwindCSS debe buscar clases utilitarias dentro del frontend.
 * @why Existe para generar solo el CSS que realmente usamos y mantener el bundle pequeno.
 * @returns Configuracion tipada de TailwindCSS.
 * @example Tailwind lo carga automaticamente durante `npm run dev` y `npm run build`.
 */
const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [],
};

export default config;

/**
 * Responsabilidades del archivo:
 * - Declarar las rutas donde Tailwind detecta clases.
 * - Centralizar futuras extensiones del tema visual.
 * - Evitar CSS muerto en la salida final.
 */

