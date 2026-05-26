export interface AuthenticatedUser {
  id: number;
  email: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: AuthenticatedUser;
  tokens: AuthTokens;
}

export interface StoredDocument {
  id: number;
  userId: number;
  name: string;
  size: number;
  chunkCount: number;
  createdAt: string;
}

export interface SourceChunk {
  chunkId: number;
  documentId: number;
  documentName: string;
  text: string;
  score: number;
  chunkIndex: number;
}

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

export interface SystemStatus {
  status: 'ok';
  openAiConfigured: boolean;
  chatModel: string;
  maxChunksContext: number;
  minSimilarityScore: number;
  maxFileSizeMb: number;
}

/**
 * Responsabilidades del archivo:
 * - Reflejar en frontend los contratos publicos del backend.
 * - Evitar `any` en services, stores y componentes.
 * - Mantener tipos compartidos listos para extraerse a un paquete comun si el proyecto crece.
 */
