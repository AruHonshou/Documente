/**
 * @description Conecta TailwindCSS y Autoprefixer con el pipeline de CSS de Vite.
 * @why Existe porque Tailwind necesita PostCSS para transformar directivas como `@tailwind`.
 * @returns Configuracion de plugins PostCSS.
 * @example Vite lo lee automaticamente al procesar `src/index.css`.
 */
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};

/**
 * Responsabilidades del archivo:
 * - Ejecutar TailwindCSS durante el build del frontend.
 * - Agregar prefijos CSS necesarios con Autoprefixer.
 */

