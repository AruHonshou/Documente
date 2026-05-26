/**
 * @description Convierte un vector numerico en Buffer binario Float32.
 * @why Existe para guardar embeddings compactos en SQLite como BLOB.
 * @param embedding - Vector de floats devuelto por OpenAI.
 * @returns Buffer listo para insertar en SQLite.
 * @example const blob = serializeEmbedding([0.1, 0.2]);
 */
export function serializeEmbedding(embedding: number[]): Buffer {
  const floatArray = Float32Array.from(embedding);

  return Buffer.from(floatArray.buffer);
}

/**
 * @description Convierte un BLOB SQLite de vuelta a vector numerico.
 * @why Existe para que la busqueda vectorial de Fase 3 pueda calcular similitud coseno.
 * @param buffer - BLOB guardado en la tabla chunks.
 * @returns Vector de floats como arreglo normal de JavaScript.
 * @example const vector = deserializeEmbedding(row.embedding);
 */
export function deserializeEmbedding(buffer: Buffer): number[] {
  const floatArray = new Float32Array(buffer.buffer, buffer.byteOffset, buffer.byteLength / Float32Array.BYTES_PER_ELEMENT);

  return Array.from(floatArray);
}

/**
 * Responsabilidades del archivo:
 * - Serializar embeddings para almacenamiento eficiente.
 * - Deserializar embeddings para futura busqueda semantica.
 * - Mantener aislado el detalle de Float32Array y Buffer.
 */

