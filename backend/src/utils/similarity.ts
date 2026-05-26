/**
 * @description Calcula similitud coseno entre dos embeddings.
 * @why Existe porque RAG necesita ordenar chunks por cercania semantica a la pregunta.
 * @param left - Primer vector numerico.
 * @param right - Segundo vector numerico.
 * @returns Valor entre -1 y 1 donde 1 significa maxima similitud.
 * @example const score = cosineSimilarity(queryEmbedding, chunkEmbedding);
 */
export function cosineSimilarity(left: number[], right: number[]): number {
  if (left.length === 0 || right.length === 0 || left.length !== right.length) {
    return 0;
  }

  let dotProduct = 0;
  let leftMagnitude = 0;
  let rightMagnitude = 0;

  for (let index = 0; index < left.length; index += 1) {
    const leftValue = left[index] ?? 0;
    const rightValue = right[index] ?? 0;

    dotProduct += leftValue * rightValue;
    leftMagnitude += leftValue * leftValue;
    rightMagnitude += rightValue * rightValue;
  }

  if (leftMagnitude === 0 || rightMagnitude === 0) {
    return 0;
  }

  return dotProduct / (Math.sqrt(leftMagnitude) * Math.sqrt(rightMagnitude));
}

/**
 * Responsabilidades del archivo:
 * - Comparar embeddings sin depender de una base vectorial externa.
 * - Manejar vectores invalidos devolviendo similitud cero.
 * - Servir como base para `searchDocuments`.
 */

