/** @type {import('jest').Config} */
module.exports = {
  clearMocks: true,
  extensionsToTreatAsEsm: ['.ts'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/src/**/*.test.ts'],
  transform: {
    '^.+\\.ts$': ['ts-jest', { tsconfig: { isolatedModules: true }, useESM: true }],
  },
};

/**
 * Responsabilidades del archivo:
 * - Configurar Jest para TypeScript con modulos ESM.
 * - Permitir imports internos con extension `.js` usados por NodeNext.
 * - Buscar tests junto al codigo backend.
 */
