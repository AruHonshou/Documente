import { env } from '../../config/env.js';
import type { ChatHistoryMessage, SourceChunk } from '../../types/rag.types.js';
import { getOpenAiClient } from '../embedding.service.js';

interface ChatCompletionMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/**
 * @agent generateAnswer
 * @description Genera una respuesta usando pregunta, historial y chunks recuperados.
 * @why Es una skill porque concentra la interaccion con el modelo conversacional y el prompt RAG.
 * @skills No invoca otras skills; llama al modelo de chat configurado.
 * @input query, chunks relevantes y chatHistory.
 * @output Respuesta final en texto plano con base en las fuentes.
 */
export async function generateAnswer(
  query: string,
  chunks: SourceChunk[],
  chatHistory: ChatHistoryMessage[],
): Promise<string> {
  const response = await getOpenAiClient().chat.completions.create({
    model: env.OPENAI_CHAT_MODEL,
    temperature: 0.2,
    messages: buildRagMessages(query, chunks, chatHistory),
  });

  return response.choices[0]?.message.content?.trim() ?? 'No pude generar una respuesta con el contexto disponible.';
}

/**
 * @description Genera una respuesta como stream real desde OpenAI.
 * @why Existe para que el frontend reciba tokens conforme el modelo los produce, no solo texto troceado despues.
 * @param query - Pregunta original del usuario.
 * @param chunks - Fuentes recuperadas por similitud.
 * @param chatHistory - Historial reciente de conversacion.
 * @returns AsyncGenerator de fragmentos de texto del assistant.
 * @example for await (const delta of streamAnswer(query, chunks, history)) {}
 */
export async function* streamAnswer(
  query: string,
  chunks: SourceChunk[],
  chatHistory: ChatHistoryMessage[],
): AsyncGenerator<string> {
  const stream = await getOpenAiClient().chat.completions.create({
    model: env.OPENAI_CHAT_MODEL,
    temperature: 0.2,
    stream: true,
    messages: buildRagMessages(query, chunks, chatHistory),
  });

  for await (const event of stream) {
    const delta = event.choices[0]?.delta.content;

    if (typeof delta === 'string') {
      yield delta;
    }
  }
}

/**
 * @description Construye mensajes del prompt RAG compartidos por respuesta normal y streaming.
 * @why Existe para que ambos caminos mantengan la misma politica de fuentes y no alucinacion.
 * @param query - Pregunta del usuario.
 * @param chunks - Chunks recuperados.
 * @param chatHistory - Historial conversacional reciente.
 * @returns Mensajes compatibles con Chat Completions.
 * @example const messages = buildRagMessages(query, chunks, history);
 */
function buildRagMessages(
  query: string,
  chunks: SourceChunk[],
  chatHistory: ChatHistoryMessage[],
): ChatCompletionMessage[] {
  const context = chunks
    .map((chunk, index): string => `[Fuente ${index + 1} | chunk ${chunk.chunkIndex} | score ${chunk.score.toFixed(3)}]\n${chunk.text}`)
    .join('\n\n');

  return [
    {
      role: 'system',
      content:
        'Sos un asistente RAG. Responde solo con la informacion del contexto cuando sea posible. Si el contexto no alcanza, decilo claramente y no inventes fuentes.',
    },
    ...chatHistory.slice(-8).map((message): ChatCompletionMessage => ({
      role: message.role,
      content: message.content,
    })),
    {
      role: 'user',
      content: `Contexto disponible:\n${context || 'No se encontraron fuentes con similitud suficiente.'}\n\nPregunta: ${query}`,
    },
  ];
}

/**
 * Responsabilidades del archivo:
 * - Construir el prompt RAG con fuentes recuperadas.
 * - Mantener baja temperatura para respuestas consistentes.
 * - Soportar respuesta normal y streaming real desde OpenAI.
 */
