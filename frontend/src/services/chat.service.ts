import { apiClient } from './apiClient';
import { listDemoMessages, listDemoSessions, streamDemoAnswer } from './demo.service';
import type { AskQuestionResult, ChatMessage, ChatSession } from '../types/api.types';
import { accessTokenStorageKey, apiBaseUrl, isDemoMode } from '../utils/constants';

interface ListSessionsResponse {
  sessions: ChatSession[];
}

interface ListMessagesResponse {
  messages: ChatMessage[];
}

/**
 * @description Lista sesiones de chat del usuario autenticado.
 * @why Existe para recuperar conversaciones disponibles en el frontend.
 * @returns Sesiones ordenadas por fecha.
 * @example const sessions = await listSessionsRequest();
 */
export async function listSessionsRequest(): Promise<ChatSession[]> {
  if (isDemoMode) {
    return listDemoSessions();
  }

  const response = await apiClient.get<ListSessionsResponse>('/api/chat/sessions');

  return response.data.sessions;
}

/**
 * @description Lista mensajes de una sesion.
 * @why Existe para restaurar el historial al abrir un chat.
 * @param sessionId - Identificador de sesion.
 * @returns Mensajes persistidos.
 * @example const messages = await listMessagesRequest(1);
 */
export async function listMessagesRequest(sessionId: number): Promise<ChatMessage[]> {
  if (isDemoMode) {
    return listDemoMessages(sessionId);
  }

  const response = await apiClient.get<ListMessagesResponse>(`/api/chat/sessions/${sessionId}/messages`);

  return response.data.messages;
}

/**
 * @description Envia una pregunta al RAGAgent del backend.
 * @why Existe para que el componente de chat solo trabaje con pregunta/documento/sesion.
 * @param documentId - Documento seleccionado.
 * @param question - Pregunta escrita por el usuario.
 * @param sessionId - Sesion existente opcional.
 * @returns Mensajes creados por backend y sesion usada.
 * @example const result = await askQuestionRequest(2, 'Que dice?', 1);
 */
export async function askQuestionRequest(
  documentId: number,
  question: string,
  sessionId?: number,
): Promise<AskQuestionResult> {
  if (isDemoMode) {
    const result: Partial<AskQuestionResult> = {};

    await streamDemoAnswer(
      documentId,
      question,
      (event): void => {
        if (event.type === 'session') {
          result.session = event.session as ChatSession;
        }

        if (event.type === 'user_message') {
          result.userMessage = event.message as ChatMessage;
        }

        if (event.type === 'assistant_done') {
          result.assistantMessage = event.message as ChatMessage;
        }
      },
      sessionId,
    );

    if (result.session === undefined || result.userMessage === undefined || result.assistantMessage === undefined) {
      throw new Error('DEMO_CHAT_FAILED');
    }

    return {
      session: result.session,
      userMessage: result.userMessage,
      assistantMessage: result.assistantMessage,
    };
  }

  const response = await apiClient.post<AskQuestionResult>('/api/chat/ask', {
    documentId,
    question,
    sessionId,
  });

  return response.data;
}

export type ChatStreamEvent =
  | { type: 'session'; session: ChatSession }
  | { type: 'user_message'; message: ChatMessage }
  | { type: 'assistant_delta'; delta: string }
  | { type: 'assistant_done'; message: ChatMessage }
  | { type: 'error'; message: string };

/**
 * @description Envia una pregunta y procesa eventos NDJSON de respuesta progresiva.
 * @why Existe para conectar el chat con streaming usando fetch y header Authorization.
 * @param documentId - Documento seleccionado.
 * @param question - Pregunta escrita por el usuario.
 * @param onEvent - Callback invocado por cada evento recibido.
 * @param sessionId - Sesion existente opcional.
 * @returns Promesa que finaliza cuando el stream termina.
 * @example await askQuestionStreamRequest(1, 'Resumen', handleEvent);
 */
export async function askQuestionStreamRequest(
  documentId: number,
  question: string,
  onEvent: (event: ChatStreamEvent) => void,
  sessionId?: number,
): Promise<void> {
  if (isDemoMode) {
    await streamDemoAnswer(
      documentId,
      question,
      (event): void => {
        onEvent(event as ChatStreamEvent);
      },
      sessionId,
    );
    return;
  }

  const token = localStorage.getItem(accessTokenStorageKey);
  const response = await fetch(`${apiBaseUrl}/api/chat/ask/stream`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token === null ? {} : { Authorization: `Bearer ${token}` }),
    },
    body: JSON.stringify({ documentId, question, sessionId }),
  });

  if (!response.ok || response.body === null) {
    throw new Error('CHAT_STREAM_FAILED');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();

    if (done) {
      break;
    }

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';

    for (const line of lines) {
      if (line.trim().length > 0) {
        onEvent(JSON.parse(line) as ChatStreamEvent);
      }
    }
  }
}

/**
 * Responsabilidades del archivo:
 * - Encapsular endpoints del chat RAG.
 * - Mantener tipado el resultado de preguntas.
 * - Separar comunicacion HTTP normal y streaming de componentes visuales.
 */
