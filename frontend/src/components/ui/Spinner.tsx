import type { ReactElement } from 'react';

/**
 * @component Spinner
 * @description Renderiza un indicador compacto de carga.
 * @why Existe para mostrar procesos asincronos sin repetir markup animado.
 * @props No recibe props; mantiene tamano fijo para no mover layout.
 */
export function Spinner(): ReactElement {
  return <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />;
}

/**
 * Responsabilidades del archivo:
 * - Mostrar estado loading en botones y paneles.
 * - Mantener dimensiones estables.
 * - Reutilizar animacion CSS de Tailwind.
 */

