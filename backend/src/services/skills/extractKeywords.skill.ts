import type { ChatHistoryMessage, SourceChunk } from '../../types/rag.types.js';
import { generateAnswer } from './generateAnswer.skill.js';
import { searchDocuments } from './searchDocuments.skill.js';

/**
 * @agent extractKeywords
 * @description Extrae temas y palabras clave desde el documento seleccionado.
 * @why Es una skill porque la salida esperada es analitica y reutilizable por el agente.
 * @skills searchDocuments, generateAnswer.
 * @input userId, documentId, query e historial.
 * @output Lista explicada de temas principales con fuentes.
 */
export async function extractKeywords(
  userId: number,
  documentId: number,
  query: string,
  chatHistory: ChatHistoryMessage[],
): Promise<{ answer: string; sources: SourceChunk[] }> {
  const keywordQuery = `Temas principales y palabras clave del documento: ${query}`;
  const sources = await searchDocuments(keywordQuery, userId, documentId);
  const answer = await generateAnswer(
    'Extrae palabras clave y temas principales. Agrupalos por relevancia y explica brevemente por que importan.',
    sources,
    chatHistory,
  );

  return { answer, sources };
}

/**
 * Responsabilidades del archivo:
 * - Resolver intenciones de keywords.
 * - Reutilizar las skills de busqueda y generacion.
 * - Devolver fuentes para justificar temas detectados.
 */

