/**
 * @description Convierte bytes a una etiqueta legible.
 * @why Existe para que el dashboard muestre tamano de archivos sin calculos en JSX.
 * @param bytes - Tamano original del archivo en bytes.
 * @returns Texto compacto como `1.2 MB`.
 * @example formatFileSize(2048);
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * @description Formatea una fecha ISO para lectura rapida.
 * @why Existe para mantener consistente la visualizacion de fechas.
 * @param value - Fecha serializada por el backend.
 * @returns Fecha local corta.
 * @example formatDate('2026-05-25T10:00:00Z');
 */
export function formatDate(value: string): string {
  return new Intl.DateTimeFormat('es-CR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

/**
 * Responsabilidades del archivo:
 * - Formatear datos de backend para UI.
 * - Mantener componentes libres de logica repetitiva.
 * - Centralizar decisiones de locale.
 */

