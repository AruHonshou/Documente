import { getDatabase } from '../db/connection.js';
import type { AuthenticatedUser } from '../types/auth.types.js';
import type { DocumentChunkInput, ProcessedDocument, StoredDocument, SupportedDocumentMimeType } from '../types/document.types.js';
import { chunkText } from '../utils/chunker.js';
import { serializeEmbedding } from '../utils/embeddingSerializer.js';
import { env } from '../config/env.js';
import { extractDocumentText } from './documentText.service.js';
import { generateEmbeddings } from './embedding.service.js';

interface DocumentRow {
  id: number;
  user_id: number;
  name: string;
  size: number;
  chunk_count: number;
  created_at: string;
}

/**
 * @description Procesa un archivo subido: extrae texto, crea chunks, genera embeddings y guarda todo.
 * @why Existe como servicio de negocio para que el controller no conozca parsing, OpenAI ni SQL.
 * @param user - Usuario autenticado propietario del documento.
 * @param file - Archivo validado por Multer y mantenido en memoria.
 * @returns Documento guardado y resumen de chunks creados.
 * @example const result = await processUploadedDocument(user, req.file);
 */
export async function processUploadedDocument(user: AuthenticatedUser, file: Express.Multer.File): Promise<ProcessedDocument> {
  const extracted = await extractDocumentText(file.buffer, file.mimetype as SupportedDocumentMimeType);
  const chunks = chunkText(extracted.text, env.CHUNK_SIZE_TOKENS, env.CHUNK_OVERLAP_TOKENS);

  if (chunks.length === 0) {
    throw new Error('EMPTY_DOCUMENT_TEXT');
  }

  const embeddings = await generateEmbeddings(chunks.map((chunk): string => chunk.text));

  if (embeddings.length !== chunks.length) {
    throw new Error('EMBEDDING_COUNT_MISMATCH');
  }

  const chunksWithEmbeddings: DocumentChunkInput[] = chunks.map((chunk, index): DocumentChunkInput => ({
    text: chunk.text,
    tokenCount: chunk.tokenCount,
    chunkIndex: chunk.chunkIndex,
    embedding: embeddings[index] ?? [],
  }));

  const document = saveDocumentWithChunks(user, file, chunksWithEmbeddings);

  return {
    document,
    chunks: chunks.map((chunk) => ({
      text: chunk.text,
      tokenCount: chunk.tokenCount,
      chunkIndex: chunk.chunkIndex,
    })),
  };
}

/**
 * @description Lista documentos pertenecientes al usuario autenticado.
 * @why Existe para que el frontend pueda mostrar solo recursos propios del usuario.
 * @param user - Usuario autenticado usado como filtro de propiedad.
 * @returns Documentos del usuario ordenados del mas reciente al mas antiguo.
 * @example const documents = listUserDocuments(user);
 */
export function listUserDocuments(user: AuthenticatedUser): StoredDocument[] {
  const db = getDatabase();
  const rows = db
    .prepare(
      `SELECT id, user_id, name, size, chunk_count, created_at
       FROM documents
       WHERE user_id = ?
       ORDER BY created_at DESC, id DESC`,
    )
    .all(user.id) as DocumentRow[];

  return rows.map(mapDocumentRow);
}

/**
 * @description Elimina un documento y sus datos asociados si pertenece al usuario autenticado.
 * @why Existe para que el usuario pueda gestionar su base de conocimiento sin tocar recursos ajenos.
 * @param user - Usuario autenticado propietario esperado.
 * @param documentId - Identificador del documento a eliminar.
 * @returns No devuelve valor; lanza error si el documento no existe para ese usuario.
 * @example deleteUserDocument(user, 10);
 */
export function deleteUserDocument(user: AuthenticatedUser, documentId: number): void {
  const result = getDatabase()
    .prepare('DELETE FROM documents WHERE id = ? AND user_id = ?')
    .run(documentId, user.id);

  if (result.changes === 0) {
    throw new Error('DOCUMENT_NOT_FOUND');
  }
}

/**
 * @description Guarda el documento y sus chunks en una sola transaccion SQLite.
 * @why Existe para evitar que queden chunks sin documento o documentos sin chunks si algo falla.
 * @param user - Usuario propietario del documento.
 * @param file - Metadata del archivo subido.
 * @param chunks - Chunks con embeddings ya generados.
 * @returns Documento persistido con id y metadata.
 * @example const document = saveDocumentWithChunks(user, file, chunks);
 */
function saveDocumentWithChunks(
  user: AuthenticatedUser,
  file: Express.Multer.File,
  chunks: DocumentChunkInput[],
): StoredDocument {
  const db = getDatabase();
  const transaction = db.transaction((): StoredDocument => {
    const insertDocument = db.prepare(
      `INSERT INTO documents (user_id, name, size, chunk_count)
       VALUES (?, ?, ?, ?)`,
    );
    const insertDocumentResult = insertDocument.run(user.id, file.originalname, file.size, chunks.length);
    const documentId = Number(insertDocumentResult.lastInsertRowid);
    const insertChunk = db.prepare(
      `INSERT INTO chunks (document_id, user_id, text, embedding, token_count, chunk_index)
       VALUES (?, ?, ?, ?, ?, ?)`,
    );

    for (const chunk of chunks) {
      insertChunk.run(
        documentId,
        user.id,
        chunk.text,
        serializeEmbedding(chunk.embedding),
        chunk.tokenCount,
        chunk.chunkIndex,
      );
    }

    const row = db
      .prepare(
        `SELECT id, user_id, name, size, chunk_count, created_at
         FROM documents
         WHERE id = ? AND user_id = ?`,
      )
      .get(documentId, user.id) as DocumentRow | undefined;

    if (row === undefined) {
      throw new Error('DOCUMENT_SAVE_FAILED');
    }

    return mapDocumentRow(row);
  });

  return transaction();
}

/**
 * @description Convierte una fila SQLite snake_case a objeto TypeScript camelCase.
 * @why Existe para no filtrar detalles de base de datos hacia controllers o frontend.
 * @param row - Fila devuelta por better-sqlite3.
 * @returns Documento con nombres de propiedades propios de TypeScript.
 * @example const document = mapDocumentRow(row);
 */
function mapDocumentRow(row: DocumentRow): StoredDocument {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    size: row.size,
    chunkCount: row.chunk_count,
    createdAt: row.created_at,
  };
}

/**
 * Responsabilidades del archivo:
 * - Orquestar procesamiento completo de documentos.
 * - Verificar propiedad por `user.id` en lecturas y escrituras.
 * - Persistir documentos y chunks con queries parametrizadas.
 * - Eliminar documentos propios usando cascadas SQLite.
 */
