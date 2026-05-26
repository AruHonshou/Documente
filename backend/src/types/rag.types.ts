export interface SourceChunk {
  chunkId: number;
  documentId: number;
  documentName: string;
  text: string;
  score: number;
  chunkIndex: number;
}

export interface ChatHistoryMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface RagAgentInput {
  userId: number;
  documentId: number;
  query: string;
  chatHistory: ChatHistoryMessage[];
}

export interface RagAgentOutput {
  answer: string;
  sources: SourceChunk[];
}

/**
 * Responsabilidades del archivo:
 * - Compartir contratos del sistema RAG entre agente, skills y chat service.
 * - Definir la forma publica de las fuentes citables.
 * - Mantener el historial de chat con roles compatibles con modelos conversacionales.
 */

