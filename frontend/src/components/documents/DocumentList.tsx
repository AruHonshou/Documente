import { FileText, MessageSquare, Sparkles, Trash2 } from 'lucide-react';
import type { ReactElement } from 'react';
import { Link } from 'react-router-dom';
import type { StoredDocument } from '../../types/api.types';
import { formatDate, formatFileSize } from '../../utils/formatters';
import { Badge } from '../ui/Badge';

interface DocumentListProps {
  documents: StoredDocument[];
  isBusy: boolean;
  onDelete: (documentId: number) => Promise<void>;
}

/**
 * @component DocumentList
 * @description Renderiza documentos subidos con metadata y acciones de chat/eliminacion.
 * @why Existe separado para mantener DashboardPage enfocado en composicion de secciones.
 * @props documents es la lista, isBusy bloquea acciones y onDelete elimina documentos propios.
 */
export function DocumentList({ documents, isBusy, onDelete }: DocumentListProps): ReactElement {
  if (documents.length === 0) {
    return (
      <div className="panel flex min-h-72 flex-col items-center justify-center p-8 text-center">
        <div className="rounded-md border border-teal-300/20 bg-teal-300/10 p-4 text-teal-100">
          <Sparkles size={28} />
        </div>
        <h2 className="mt-5 text-xl font-semibold text-white">Tu base de conocimiento empieza aqui</h2>
        <p className="mt-3 max-w-md text-sm leading-6 text-zinc-400">
          Subi un documento para generar chunks, embeddings y una conversacion con fuentes verificables.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {documents.map((document): ReactElement => (
        <article className="panel p-4 transition hover:border-teal-300/30 hover:bg-zinc-900/80" key={document.id}>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <FileText className="shrink-0 text-teal-200" size={18} />
                <h3 className="truncate text-base font-semibold text-white">{document.name}</h3>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge>{formatFileSize(document.size)}</Badge>
                <Badge>{document.chunkCount} chunks</Badge>
                <Badge>{formatDate(document.createdAt)}</Badge>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-white/10 bg-white/[0.06] px-4 text-sm font-semibold text-zinc-100 transition hover:bg-white/[0.1]"
                to={`/chat/${document.id}`}
              >
                <MessageSquare size={16} />
                Abrir chat
              </Link>
              <button
                className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-red-400/20 bg-red-950/40 px-3 text-sm font-semibold text-red-100 transition hover:bg-red-950/70 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={isBusy}
                onClick={(): void => {
                  const confirmed = window.confirm(`Eliminar "${document.name}" tambien borrara sus chats asociados.`);

                  if (confirmed) {
                    void onDelete(document.id);
                  }
                }}
                title="Eliminar documento"
                type="button"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

/**
 * Responsabilidades del archivo:
 * - Mostrar documentos disponibles.
 * - Exponer metadata util para inspeccion rapida.
 * - Conectar cada documento con chat o eliminacion segura.
 */

