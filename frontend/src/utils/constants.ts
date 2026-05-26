export const apiBaseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';
export const accessTokenStorageKey = 'rag_access_token';
export const refreshTokenStorageKey = 'rag_refresh_token';
export const isDemoMode = import.meta.env.VITE_DEMO_MODE === 'true';
export const routerBaseName = import.meta.env.VITE_BASE_PATH ?? '/';

/**
 * Responsabilidades del archivo:
 * - Centralizar constantes usadas por servicios del frontend.
 * - Evitar strings repetidos para localStorage y URL base.
 * - Permitir cambiar backend desde `VITE_API_URL`.
 * - Activar modo demo y base path cuando se publica en GitHub Pages.
 */
