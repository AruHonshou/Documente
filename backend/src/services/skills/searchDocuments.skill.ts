import { getDatabase } from '../../db/connection.js';
import { env } from '../../config/env.js';
import type { SourceChunk } from '../../types/rag.types.js';
import { deserializeEmbedding } from '../../utils/embeddingSerializer.js';
import { cosineSimilarity } from '../../utils/similarity.js';
import { generateEmbeddings } from '../embedding.service.js';

interface ChunkRow {
  id: number;
  document_id: number;
  document_name: string;
  text: string;
  embedding: Buffer;
  chunk_index: number;
}

/**
 * @agent searchDocuments
 * @description Busca los chunks mas relevantes de un documento para una pregunta.
 * @why Es una skill atomica porque encapsula recuperacion semantica y puede reutilizarse por varios agentes.
 * @skills No invoca otras skills; usa embeddings y similitud coseno.
 * @input query, userId y documentId.
 * @output Lista de chunks con score ordenados por relevancia.
 */
export async function searchDocuments(query: string, userId: number, documentId: number): Promise<SourceChunk[]> {
  const [queryEmbedding] = await generateEmbeddings([query]);

  if (queryEmbedding === undefined) {
    return [];
  }

  const rows = loadDocumentChunks(userId, documentId);
  const scoredChunks = rows.map((row): SourceChunk => ({
    chunkId: row.id,
    documentId: row.document_id,
    documentName: row.document_name,
    text: row.text,
    score: cosineSimilarity(queryEmbedding, deserializeEmbedding(row.embedding)),
    chunkIndex: row.chunk_index,
  }));

  return scoredChunks
    .filter((chunk): boolean => chunk.score >= env.MIN_SIMILARITY_SCORE)
    .sort((left, right): number => right.score - left.score)
    .slice(0, env.MAX_CHUNKS_CONTEXT);
}

/**
 * @description Carga chunks de un documento verificando propiedad por usuario.
 * @why Existe para impedir que una consulta RAG lea documentos de otro usuario.
 * @param userId - Usuario autenticado.
 * @param documentId - Documento seleccionado por el usuario.
 * @returns Filas de chunks con embedding y nombre del documento.
 * @example const rows = loadDocumentChunks(1, 10);
 */
function loadDocumentChunks(userId: number, documentId: number): ChunkRow[] {
  const db = getDatabase();

  return db
    .prepare(
      `SELECT chunks.id, chunks.document_id, documents.name AS document_name,
              chunks.text, chunks.embedding, chunks.chunk_index
       FROM chunks
       INNER JOIN documents ON documents.id = chunks.document_id
       WHERE chunks.user_id = ? AND chunks.document_id = ? AND documents.user_id = ?
       ORDER BY chunks.chunk_index ASC`,
    )
    .all(userId, documentId, userId) as ChunkRow[];
}

/**
 * Responsabilidades del archivo:
 * - Crear embedding de la pregunta.
 * - Comparar contra chunks persistidos del usuario.
 * - Devolver solo chunks que superan el umbral minimo de similitud.
 */
