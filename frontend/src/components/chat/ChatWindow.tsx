import { Bot, FileText } from 'lucide-react';
import type { ReactElement } from 'react';
import type { ChatMessage, StoredDocument } from '../../types/api.types';
import { InputBar } from './InputBar';
import { MessageBubble } from './MessageBubble';

interface ChatWindowProps {
  document: StoredDocument | undefined;
  messages: ChatMessage[];
  isLoading: boolean;
  onSend: (message: string) => Promise<void>;
}

/**
 * @component ChatWindow
 * @description Renderiza cabecera del documento, historial y barra de entrada.
 * @why Existe como componente de alto nivel para componer el flujo conversacional.
 * @props document identifica el archivo, messages contiene historial, isLoading bloquea input y onSend envia preguntas.
 */
export function ChatWindow({ document, messages, isLoading, onSend }: ChatWindowProps): ReactElement {
  return (
    <section className="panel flex min-h-[calc(100vh-8rem)] flex-col overflow-hidden">
      <header className="flex items-center gap-3 border-b border-white/10 px-5 py-4">
        <div className="rounded-md border border-teal-300/20 bg-teal-300/10 p-3 text-teal-100">
          <FileText size={20} />
        </div>
        <div className="min-w-0">
          <h1 className="truncate text-lg font-semibold text-white">{document?.name ?? 'Chat RAG'}</h1>
          <p className="mt-1 text-sm text-zinc-400">Respuestas basadas en chunks recuperados y fuentes inspeccionables.</p>
        </div>
      </header>
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <div className="muted-panel flex min-h-80 flex-col items-center justify-center p-8 text-center">
            <div className="rounded-md border border-teal-300/20 bg-teal-300/10 p-4 text-teal-100">
              <Bot size={28} />
            </div>
            <h2 className="mt-5 text-xl font-semibold text-white">Listo para consultar el documento</h2>
            <p className="mt-3 max-w-lg text-sm leading-6 text-zinc-400">
              Hace una pregunta, pedi un resumen o solicita palabras clave para activar el agente RAG.
            </p>
          </div>
        ) : (
          messages.map((message): ReactElement => <MessageBubble key={message.id} message={message} />)
        )}
      </div>
      <InputBar disabled={isLoading || document === undefined} onSend={onSend} />
    </section>
  );
}

/**
 * Responsabilidades del archivo:
 * - Organizar la experiencia de chat completa.
 * - Mantener layout estable entre historial y entrada.
 * - Delegar render de mensajes y entrada a componentes especializados.
 */

