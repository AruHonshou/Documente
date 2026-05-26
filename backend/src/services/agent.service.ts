import type { RagAgentInput, RagAgentOutput } from '../types/rag.types.js';
import { extractKeywords } from './skills/extractKeywords.skill.js';
import { generateAnswer } from './skills/generateAnswer.skill.js';
import { searchDocuments } from './skills/searchDocuments.skill.js';
import { summarizeDocument } from './skills/summarizeDocument.skill.js';

export type RagIntent = 'summary' | 'keywords' | 'answer';

/**
 * @agent RAGAgent
 * @description Orquesta la intencion del usuario y decide que skills ejecutar.
 * @why Es un agente porque toma decisiones entre busqueda, resumen y extraccion de keywords.
 * @skills searchDocuments, generateAnswer, summarizeDocument, extractKeywords.
 * @input Usuario, documento, pregunta e historial de chat.
 * @output Respuesta final y fuentes usadas.
 */
export async function runRagAgent(input: RagAgentInput): Promise<RagAgentOutput> {
  const intent = detectRagIntent(input.query);

  if (intent === 'summary') {
    return summarizeDocument(input.userId, input.documentId, input.query, input.chatHistory);
  }

  if (intent === 'keywords') {
    return extractKeywords(input.userId, input.documentId, input.query, input.chatHistory);
  }

  const sources = await searchDocuments(input.query, input.userId, input.documentId);
  const answer = await generateAnswer(input.query, sources, input.chatHistory);

  return { answer, sources };
}

/**
 * @description Detecta si el usuario pide un resumen.
 * @why Existe para enrutar la pregunta hacia una skill especializada sin pedir configuracion extra.
 * @param query - Pregunta original del usuario.
 * @returns `true` cuando la intencion parece ser resumen.
 * @example isSummaryIntent('resumime este documento');
 */
function isSummaryIntent(query: string): boolean {
  return /\b(resumen|resumir|resumime|summary|summarize)\b/i.test(query);
}

/**
 * @description Detecta si el usuario pide keywords o temas principales.
 * @why Existe para activar una skill de extraccion en lugar de una respuesta libre.
 * @param query - Pregunta original del usuario.
 * @returns `true` cuando la intencion parece ser keywords.
 * @example isKeywordIntent('cuales son las palabras clave');
 */
function isKeywordIntent(query: string): boolean {
  return /\b(keyword|keywords|palabras clave|temas principales|conceptos clave)\b/i.test(query);
}

/**
 * @description Clasifica la intencion RAG principal desde la pregunta del usuario.
 * @why Existe para que las rutas con y sin streaming usen la misma decision de agente.
 * @param query - Pregunta original del usuario.
 * @returns Tipo de intencion que define que skill debe ejecutarse.
 * @example const intent = detectRagIntent('resumi este contrato');
 */
export function detectRagIntent(query: string): RagIntent {
  if (isSummaryIntent(query)) {
    return 'summary';
  }

  if (isKeywordIntent(query)) {
    return 'keywords';
  }

  return 'answer';
}

/**
 * Responsabilidades del archivo:
 * - Decidir que skill conviene para cada pregunta.
 * - Mantener fallback normal de RAG pregunta-respuesta.
 * - Ocultar detalles de skills al chat service.
 */
