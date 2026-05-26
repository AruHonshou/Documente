import { deserializeEmbedding, serializeEmbedding } from './embeddingSerializer.js';

describe('embedding serialization', (): void => {
  it('round-trips numeric vectors through Float32 buffers', (): void => {
    const vector = [0.25, -0.5, 1.75];
    const restored = deserializeEmbedding(serializeEmbedding(vector));

    expect(restored).toHaveLength(vector.length);
    expect(restored[0]).toBeCloseTo(0.25);
    expect(restored[1]).toBeCloseTo(-0.5);
    expect(restored[2]).toBeCloseTo(1.75);
  });
});

/**
 * Responsabilidades del archivo:
 * - Probar almacenamiento binario de embeddings.
 * - Confirmar compatibilidad Buffer <-> Float32Array.
 * - Reducir riesgo antes de busqueda vectorial.
 */

