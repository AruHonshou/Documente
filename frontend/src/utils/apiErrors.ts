import axios from 'axios';

/**
 * @description Extrae mensajes de error devueltos por la API.
 * @why Existe para mostrar al usuario causas reales en vez de errores genericos de red.
 * @param error - Error desconocido capturado por un hook o service.
 * @returns Mensaje seguro para mostrar en la interfaz.
 * @example const message = getApiErrorMessage(error, 'No se pudo completar la accion.');
 */
export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (!axios.isAxiosError(error)) {
    return fallback;
  }

  if (error.response?.data !== undefined && typeof error.response.data === 'object' && 'message' in error.response.data) {
    return String(error.response.data.message);
  }

  if (error.code === 'ERR_NETWORK') {
    return 'No se pudo conectar con el backend. Verifica que la API este corriendo en el puerto 3000.';
  }

  return fallback;
}

/**
 * Responsabilidades del archivo:
 * - Traducir errores Axios a mensajes utiles.
 * - Reutilizar manejo de errores entre hooks.
 * - Evitar perder mensajes especificos enviados por el backend.
 */

