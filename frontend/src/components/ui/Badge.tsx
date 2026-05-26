import type { ReactElement, ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
}

/**
 * @component Badge
 * @description Renderiza una etiqueta pequena para metadata.
 * @why Existe para estandarizar datos como cantidad de chunks o scores.
 * @props children contiene el texto o numero a mostrar.
 */
export function Badge({ children }: BadgeProps): ReactElement {
  return (
    <span className="inline-flex min-h-6 items-center rounded-md border border-white/10 bg-white/[0.06] px-2 text-xs font-medium text-zinc-300">
      {children}
    </span>
  );
}

/**
 * Responsabilidades del archivo:
 * - Mostrar metadatos compactos.
 * - Mantener estilo visual uniforme.
 * - Evitar repetir clases en documentos y fuentes.
 */
