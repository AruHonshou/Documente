import { chunkText } from './chunker.js';

describe('chunkText', (): void => {
  it('creates overlapping chunks with stable indexes', (): void => {
    const chunks = chunkText('uno dos tres cuatro cinco seis siete', 3, 1);

    expect(chunks).toEqual([
      { text: 'uno dos tres', tokenCount: 3, chunkIndex: 0 },
      { text: 'tres cuatro cinco', tokenCount: 4, chunkIndex: 1 },
      { text: 'cinco seis siete', tokenCount: 4, chunkIndex: 2 },
    ]);
  });

  it('returns an empty list when text has no words', (): void => {
    expect(chunkText('   \n\t   ', 500, 50)).toEqual([]);
  });
});

/**
 * Responsabilidades del archivo:
 * - Probar que el chunker conserva overlap e indices.
 * - Proteger el caso de documentos vacios.
 * - Dar confianza al pipeline antes de generar embeddings.
 */

