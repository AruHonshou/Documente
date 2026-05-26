export interface StoredDocument {
  id: number;
  userId: number;
  name: string;
  size: number;
  chunkCount: number;
  createdAt: string;
}

export interface DocumentChunkInput {
  text: string;
  tokenCount: number;
  chunkIndex: number;
  embedding: number[];
}

export interface ProcessedDocument {
  document: StoredDocument;
  chunks: Omit<DocumentChunkInput, 'embedding'>[];
}

export type SupportedDocumentMimeType = 'application/pdf' | 'text/plain';

export interface ExtractedDocumentText {
  text: string;
  mimeType: SupportedDocumentMimeType;
}

/**
 * Responsabilidades del archivo:
 * - Compartir contratos de documentos entre middleware, controllers y services.
 * - Mantener separados los datos publicos del documento y los chunks internos.
 * - Expresar los MIME types soportados sin strings sueltos por el codigo.
 */

