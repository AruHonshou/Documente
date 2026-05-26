import type { ChatHistoryMessage, SourceChunk } from '../../types/rag.types.js';
import { generateAnswer } from './generateAnswer.skill.js';
import { searchDocuments } from './searchDocuments.skill.js';

/**
 * @agent summarizeDocument
 * @description Produce un resumen guiado del documento consultado.
 * @why Es una skill porque representa una intencion distinta a preguntas puntuales sobre chunks.
 * @skills searchDocuments, generateAnswer.
 * @input userId, documentId, query e historial.
 * @output Resumen del documento basado en los chunks recuperados.
 */
export async function summarizeDocument(
  userId: number,
  documentId: number,
  query: string,
  chatHistory: ChatHistoryMessage[],
): Promise<{ answer: string; sources: SourceChunk[] }> {
  const summaryQuery = `Resumen general del documento: ${query}`;
  const sources = await searchDocuments(summaryQuery, userId, documentId);
  const answer = await generateAnswer(
    'Resumi el documento en puntos claros, destacando ideas principales, conclusiones y datos importantes.',
    sources,
    chatHistory,
  );

  return { answer, sources };
}

/**
 * Responsabilidades del archivo:
 * - Resolver intenciones de resumen.
 * - Reutilizar recuperacion semantica existente.
 * - Mantener salida con fuentes para citar el resumen.
 */

