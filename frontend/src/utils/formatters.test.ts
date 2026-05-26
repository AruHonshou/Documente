import { describe, expect, it } from 'vitest';
import { formatFileSize } from './formatters';

describe('formatFileSize', (): void => {
  it('formats bytes, kilobytes and megabytes', (): void => {
    expect(formatFileSize(512)).toBe('512 B');
    expect(formatFileSize(2048)).toBe('2.0 KB');
    expect(formatFileSize(2 * 1024 * 1024)).toBe('2.0 MB');
  });
});

/**
 * Responsabilidades del archivo:
 * - Probar formateo visible de tamanos de archivo.
 * - Mantener estable la metadata del dashboard.
 * - Dar una base inicial de Vitest para frontend.
 */

