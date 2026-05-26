import type { SourceChunk } from './rag.types.js';

export interface ChatSession {
  id: number;
  userId: number;
  documentId: number;
  title: string;
  createdAt: string;
}

export interface ChatMessage {
  id: number;
  sessionId: number;
  role: 'user' | 'assistant';
  content: string;
  sources: SourceChunk[];
  createdAt: string;
}

export interface AskQuestionResult {
  session: ChatSession;
  userMessage: ChatMessage;
  assistantMessage: ChatMessage;
}

/**
 * Responsabilidades del archivo:
 * - Definir sesiones y mensajes usados por backend y frontend.
 * - Hacer explicito que solo el assistant puede devolver fuentes.
 * - Separar el resultado de una pregunta del detalle interno del agente.
 */

