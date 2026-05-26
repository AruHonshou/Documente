import type { ReactElement } from 'react';
import type { SourceChunk } from '../../types/api.types';
import { Badge } from '../ui/Badge';

interface SourceCitationProps {
  source: SourceChunk;
}

/**
 * @component SourceCitation
 * @description Renderiza una fuente usada por la respuesta RAG.
 * @why Existe para hacer auditable de donde salio cada respuesta del asistente.
 * @props source contiene chunk, score, documento y texto citado.
 */
export function SourceCitation({ source }: SourceCitationProps): ReactElement {
  return (
    <details className="rounded-md border border-white/10 bg-zinc-950/70 p-3">
      <summary className="cursor-pointer text-sm font-medium text-zinc-200">
        {source.documentName}
        <span className="ml-2 text-zinc-500">chunk {source.chunkIndex}</span>
      </summary>
      <div className="mt-3 flex flex-wrap gap-2">
        <Badge>score {source.score.toFixed(3)}</Badge>
        <Badge>fuente #{source.chunkId}</Badge>
      </div>
      <p className="mt-3 max-h-32 overflow-auto text-sm leading-6 text-zinc-400">{source.text}</p>
    </details>
  );
}

/**
 * Responsabilidades del archivo:
 * - Mostrar citas expandibles.
 * - Ensenar el score de similitud recuperado.
 * - Mantener el texto fuente inspeccionable sin saturar el chat.
 */

