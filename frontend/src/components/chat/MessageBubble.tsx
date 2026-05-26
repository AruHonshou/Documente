import type { ReactElement } from 'react';
import type { ChatMessage } from '../../types/api.types';
import { SourceCitation } from './SourceCitation';

interface MessageBubbleProps {
  message: ChatMessage;
}

/**
 * @component MessageBubble
 * @description Renderiza un mensaje del usuario o asistente con fuentes si existen.
 * @why Existe para encapsular estilos distintos por rol y mantener ChatWindow limpio.
 * @props message contiene rol, contenido y fuentes citables.
 */
export function MessageBubble({ message }: MessageBubbleProps): ReactElement {
  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <article className={`max-w-3xl rounded-md border p-4 shadow-lg shadow-black/10 ${isUser ? 'border-teal-300/20 bg-teal-300/12 text-teal-50' : 'border-white/10 bg-white/[0.055] text-zinc-100'}`}>
        <p className="whitespace-pre-wrap text-sm leading-6">{message.content || 'Generando respuesta...'}</p>
        {message.sources.length > 0 && (
          <div className="mt-4 grid gap-2">
            {message.sources.map((source): ReactElement => (
              <SourceCitation key={`${message.id}-${source.chunkId}`} source={source} />
            ))}
          </div>
        )}
      </article>
    </div>
  );
}

/**
 * Responsabilidades del archivo:
 * - Diferenciar visualmente mensajes user/assistant.
 * - Mostrar fuentes solo cuando el assistant las devuelve.
 * - Preservar saltos de linea de respuestas generadas.
 */
