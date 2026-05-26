import { ArrowLeft, FileText, RefreshCcw } from 'lucide-react';
import type { ReactElement } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { ChatWindow } from '../components/chat/ChatWindow';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { useAuth } from '../hooks/useAuth';
import { useChat } from '../hooks/useChat';
import { useDocuments } from '../hooks/useDocuments';
import { formatFileSize } from '../utils/formatters';

/**
 * @component ChatPage
 * @description Renderiza el chat RAG asociado a un documento con panel contextual.
 * @why Existe como pagina separada para conectar URL `/chat/:documentId` con el agente.
 * @props No recibe props; usa params, hooks y stores.
 */
export function ChatPage(): ReactElement {
  const { isAuthenticated } = useAuth();
  const params = useParams<{ documentId: string }>();
  const documentId = Number(params.documentId);
  const { documents, refreshDocuments } = useDocuments();
  const { messages, isLoading, error, askQuestion } = useChat();
  const document = documents.find((item) => item.id === documentId);

  if (!isAuthenticated) {
    return <Navigate replace to="/login" />;
  }

  if (!Number.isInteger(documentId) || documentId <= 0) {
    return <Navigate replace to="/dashboard" />;
  }

  /**
   * @description Envia una pregunta al hook de chat usando el documento de la URL.
   * @why Existe para fijar `documentId` en un solo lugar y mantener ChatWindow generico.
   * @param message - Pregunta escrita por el usuario.
   * @returns Promesa que finaliza cuando el backend responde.
   * @example handleSend('Dame un resumen');
   */
  async function handleSend(message: string): Promise<void> {
    await askQuestion(documentId, message);
  }

  return (
    <main className="app-shell min-h-screen">
      <section className="mx-auto grid min-h-screen max-w-7xl gap-6 px-5 py-5 lg:grid-cols-[280px_1fr]">
        <aside className="panel flex flex-col justify-between p-5">
          <div>
            <Link
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-white/10 bg-white/[0.06] px-4 text-sm font-semibold text-zinc-100 transition hover:bg-white/[0.1]"
              to="/dashboard"
            >
              <ArrowLeft size={16} />
              Dashboard
            </Link>
            <div className="mt-6 rounded-md border border-teal-300/20 bg-teal-300/10 p-4 text-teal-100">
              <FileText size={24} />
              <h1 className="mt-4 break-words text-lg font-semibold text-white">{document?.name ?? 'Documento'}</h1>
              <p className="mt-2 text-sm leading-6 text-zinc-400">Contexto recuperado desde chunks persistidos.</p>
            </div>
            {document !== undefined && (
              <div className="mt-4 flex flex-wrap gap-2">
                <Badge>{formatFileSize(document.size)}</Badge>
                <Badge>{document.chunkCount} chunks</Badge>
              </div>
            )}
          </div>
          <Button icon={<RefreshCcw size={16} />} onClick={(): void => void refreshDocuments()} variant="ghost">
            Refrescar
          </Button>
        </aside>

        <section className="space-y-3">
          {error !== null && <p className="rounded-md border border-red-400/20 bg-red-950/70 px-3 py-2 text-sm text-red-100">{error}</p>}
          <ChatWindow document={document} isLoading={isLoading} messages={messages} onSend={handleSend} />
        </section>
      </section>
    </main>
  );
}

/**
 * Responsabilidades del archivo:
 * - Proteger chat por autenticacion.
 * - Conectar documento seleccionado con preguntas RAG.
 * - Mostrar contexto del documento y errores de conversacion.
 */

