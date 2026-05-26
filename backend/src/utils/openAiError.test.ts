import { getOpenAiClientErrorMessage } from './openAiError.js';

describe('getOpenAiClientErrorMessage', (): void => {
  it('maps quota errors to a user-safe message', (): void => {
    const message = getOpenAiClientErrorMessage(new Error('429 You exceeded your current quota'));

    expect(message).toContain('cuota');
  });

  it('returns null for unknown errors', (): void => {
    expect(getOpenAiClientErrorMessage(new Error('BOOM'))).toBeNull();
  });
});

/**
 * Responsabilidades del archivo:
 * - Probar traduccion segura de errores OpenAI.
 * - Evitar filtrar detalles sensibles al cliente.
 * - Cubrir fallback para errores desconocidos.
 */

