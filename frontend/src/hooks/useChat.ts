import { useCallback, useState } from 'react';
import { askQuestionStreamRequest, listMessagesRequest, listSessionsRequest } from '../services/chat.service';
import { useChatStore } from '../store/chatStore';
import type { ChatMessage, ChatSession } from '../types/api.types';

interface UseChatResult {
  sessions: ChatSession[];
  messages: ChatMessage[];
  activeSessionId: number | null;
  isLoading: boolean;
  error: string | null;
  loadSessions: () => Promise<void>;
  loadMessages: (sessionId: number) => Promise<void>;
  askQuestion: (documentId: number, question: string) => Promise<void>;
}

/**
 * @hook useChat
 * @description Encapsula sesiones, mensajes y envio de preguntas al RAGAgent.
 * @why Esta logica no vive en ChatPage para separar networking de composicion visual.
 * @returns Estado de chat y acciones asincronas para la UI.
 */
export function useChat(): UseChatResult {
  const sessions = useChatStore((state) => state.sessions);
  const messages = useChatStore((state) => state.messages);
  const activeSessionId = useChatStore((state) => state.activeSessionId);
  const setSessions = useChatStore((state) => state.setSessions);
  const setMessages = useChatStore((state) => state.setMessages);
  const setActiveSessionId = useChatStore((state) => state.setActiveSessionId);
  const appendMessages = useChatStore((state) => state.appendMessages);
  const replaceMessage = useChatStore((state) => state.replaceMessage);
  const appendAssistantDelta = useChatStore((state) => state.appendAssistantDelta);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const loadSessions = useCallback(async (): Promise<void> => {
    setSessions(await listSessionsRequest());
  }, [setSessions]);

  const loadMessages = useCallback(async (sessionId: number): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      setActiveSessionId(sessionId);
      setMessages(await listMessagesRequest(sessionId));
    } catch {
      setError('No se pudo cargar esta conversacion.');
    } finally {
      setIsLoading(false);
    }
  }, [setActiveSessionId, setMessages]);

  const askQuestion = useCallback(async (documentId: number, question: string): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const draftAssistantId = -Date.now();

      await askQuestionStreamRequest(
        documentId,
        question,
        (event): void => {
          if (event.type === 'session') {
            setActiveSessionId(event.session.id);
          }

          if (event.type === 'user_message') {
            appendMessages([
              event.message,
              {
                id: draftAssistantId,
                sessionId: event.message.sessionId,
                role: 'assistant',
                content: '',
                sources: [],
                createdAt: new Date().toISOString(),
              },
            ]);
          }

          if (event.type === 'assistant_delta') {
            appendAssistantDelta(draftAssistantId, event.delta);
          }

          if (event.type === 'assistant_done') {
            replaceMessage(event.message);
          }

          if (event.type === 'error') {
            setError(event.message);
          }
        },
        activeSessionId ?? undefined,
      );

      await loadSessions();
    } catch {
      setError('No se pudo generar una respuesta RAG.');
    } finally {
      setIsLoading(false);
    }
  }, [activeSessionId, appendAssistantDelta, appendMessages, loadSessions, replaceMessage, setActiveSessionId]);

  return {
    sessions,
    messages,
    activeSessionId,
    isLoading,
    error,
    loadSessions,
    loadMessages,
    askQuestion,
  };
}

/**
 * Responsabilidades del archivo:
 * - Coordinar chat con el backend.
 * - Mantener sesion activa y mensajes sincronizados.
 * - Exponer errores de conversacion para la UI.
 */
