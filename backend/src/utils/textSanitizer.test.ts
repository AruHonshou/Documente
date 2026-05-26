import { sanitizeDocumentText } from './textSanitizer.js';

describe('sanitizeDocumentText', (): void => {
  it('removes control characters and normalizes whitespace', (): void => {
    const cleanText = sanitizeDocumentText(' Hola\u0000\tmundo\r\n\r\n\r\ncon   espacios ');

    expect(cleanText).toBe('Hola mundo\n\ncon espacios');
  });
});

/**
 * Responsabilidades del archivo:
 * - Probar limpieza basica de texto extraido.
 * - Evitar caracteres invisibles antes de embeddings.
 * - Mantener estable el formato enviado al chunker.
 */

