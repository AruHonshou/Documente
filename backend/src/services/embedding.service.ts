import OpenAI from 'openai';
import { env } from '../config/env.js';

const embeddingModel = 'text-embedding-3-small';
const embeddingBatchSize = 64;

let openAiClient: OpenAI | null = null;

/**
 * @description Genera embeddings para una lista de textos usando OpenAI.
 * @why Existe para centralizar el modelo, el cliente y el batching de embeddings del sistema RAG.
 * @param texts - Chunks de texto limpios que se enviaran a OpenAI.
 * @returns Lista de vectores numericos en el mismo orden de entrada.
 * @example const vectors = await generateEmbeddings(['chunk uno', 'chunk dos']);
 */
export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) {
    return [];
  }

  const embeddings: number[][] = [];

  for (let start = 0; start < texts.length; start += embeddingBatchSize) {
    const batch = texts.slice(start, start + embeddingBatchSize);
    const response = await getOpenAiClient().embeddings.create({
      model: embeddingModel,
      input: batch,
      encoding_format: 'float',
    });

    const orderedBatch = [...response.data].sort((left, right): number => left.index - right.index);

    for (const item of orderedBatch) {
      embeddings.push(item.embedding);
    }
  }

  return embeddings;
}

/**
 * @description Devuelve un cliente OpenAI inicializado de forma perezosa.
 * @why Existe para no exigir `OPENAI_API_KEY` al importar archivos, solo cuando se generan embeddings.
 * @returns Cliente oficial de OpenAI configurado con la API key del entorno.
 * @example const client = getOpenAiClient();
 */
export function getOpenAiClient(): OpenAI {
  if (openAiClient !== null) {
    return openAiClient;
  }

  if (env.OPENAI_API_KEY === undefined || env.OPENAI_API_KEY.length === 0) {
    throw new Error('OPENAI_API_KEY_REQUIRED');
  }

  openAiClient = new OpenAI({
    apiKey: env.OPENAI_API_KEY,
  });

  return openAiClient;
}

/**
 * Responsabilidades del archivo:
 * - Encapsular el cliente oficial de OpenAI.
 * - Usar `text-embedding-3-small` para convertir chunks en vectores.
 * - Procesar chunks en lotes para evitar requests gigantes.
 */
