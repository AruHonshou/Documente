import axios from 'axios';
import { describe, expect, it } from 'vitest';
import { getApiErrorMessage } from './apiErrors';

describe('getApiErrorMessage', (): void => {
  it('uses backend message when present', (): void => {
    const error = new axios.AxiosError('failed', 'ERR_BAD_RESPONSE', undefined, undefined, {
      data: { message: 'Mensaje backend' },
      status: 429,
      statusText: 'Too Many Requests',
      headers: {},
      config: {} as never,
    });

    expect(getApiErrorMessage(error, 'fallback')).toBe('Mensaje backend');
  });

  it('uses fallback for non Axios errors', (): void => {
    expect(getApiErrorMessage(new Error('boom'), 'fallback')).toBe('fallback');
  });
});

/**
 * Responsabilidades del archivo:
 * - Probar mensajes de error mostrados al usuario.
 * - Confirmar prioridad de mensajes enviados por backend.
 * - Mantener consistente el fallback visual.
 */

