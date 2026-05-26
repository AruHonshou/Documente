import { cosineSimilarity } from './similarity.js';

describe('cosineSimilarity', (): void => {
  it('returns 1 for identical vectors', (): void => {
    expect(cosineSimilarity([1, 2, 3], [1, 2, 3])).toBeCloseTo(1);
  });

  it('returns 0 for incompatible vector shapes', (): void => {
    expect(cosineSimilarity([1, 2], [1, 2, 3])).toBe(0);
  });

  it('returns 0 when one vector has no magnitude', (): void => {
    expect(cosineSimilarity([0, 0], [1, 1])).toBe(0);
  });
});

/**
 * Responsabilidades del archivo:
 * - Verificar el calculo central de recuperacion semantica.
 * - Evitar errores silenciosos con vectores invalidos.
 * - Documentar el comportamiento esperado de similitud coseno.
 */

