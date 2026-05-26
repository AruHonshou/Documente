export interface TextChunk {
  text: string;
  tokenCount: number;
  chunkIndex: number;
}

/**
 * @description Divide un texto largo en chunks con overlap aproximado por tokens.
 * @why Existe porque los modelos de embeddings tienen limite de entrada y RAG necesita fragmentos recuperables.
 * @param text - Texto limpio del documento completo.
 * @param chunkSizeTokens - Cantidad aproximada de tokens por chunk.
 * @param overlapTokens - Cantidad aproximada de tokens que se repiten entre chunks consecutivos.
 * @returns Lista ordenada de chunks con indice y conteo aproximado de tokens.
 * @example const chunks = chunkText(cleanText, 500, 50);
 */
export function chunkText(text: string, chunkSizeTokens: number, overlapTokens: number): TextChunk[] {
  const words = text.split(/\s+/).filter((word: string): boolean => word.length > 0);

  if (words.length === 0) {
    return [];
  }

  const safeChunkSize = Math.max(1, chunkSizeTokens);
  const safeOverlap = Math.min(Math.max(0, overlapTokens), safeChunkSize - 1);
  const step = safeChunkSize - safeOverlap;
  const chunks: TextChunk[] = [];

  for (let start = 0; start < words.length; start += step) {
    const chunkWords = words.slice(start, start + safeChunkSize);

    if (chunkWords.length === 0) {
      break;
    }

    chunks.push({
      text: chunkWords.join(' '),
      tokenCount: estimateTokenCount(chunkWords),
      chunkIndex: chunks.length,
    });

    if (start + safeChunkSize >= words.length) {
      break;
    }
  }

  return chunks;
}

/**
 * @description Estima tokens a partir de palabras cuando no usamos un tokenizador externo.
 * @why Existe para evitar una dependencia adicional y aun asi guardar una metrica util del chunk.
 * @param words - Palabras que forman el chunk.
 * @returns Estimacion conservadora de tokens.
 * @example const tokenCount = estimateTokenCount(['hola', 'mundo']);
 */
function estimateTokenCount(words: string[]): number {
  const characterCount = words.reduce((total: number, word: string): number => total + word.length, 0);

  return Math.max(1, Math.ceil(characterCount / 4));
}

/**
 * Responsabilidades del archivo:
 * - Dividir documentos en fragmentos pequenos y solapados.
 * - Mantener el orden original mediante `chunkIndex`.
 * - Estimar tokens sin introducir dependencias fuera del stack definido.
 */

