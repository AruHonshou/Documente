import js from '@eslint/js';
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';

const nodeGlobals = {
  Buffer: 'readonly',
  console: 'readonly',
  process: 'readonly',
  URL: 'readonly',
};

const browserGlobals = {
  document: 'readonly',
  HTMLElement: 'readonly',
  window: 'readonly',
};

/**
 * @description Define reglas compartidas de ESLint para backend y frontend TypeScript.
 * @why Existe para hacer cumplir `strict`, evitar `any` explicito y detectar errores antes del runtime.
 * @returns Lista de configuraciones flat config que ESLint aplica por patron de archivo.
 * @example npm run lint
 */
const config = [
  {
    ignores: ['**/dist/**', '**/node_modules/**', '**/*.tsbuildinfo'],
  },
  js.configs.recommended,
  {
    files: ['backend/src/**/*.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: './backend/tsconfig.json',
        tsconfigRootDir: import.meta.dirname,
      },
      globals: nodeGlobals,
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
    },
    rules: {
      'no-control-regex': 'off',
      'no-undef': 'off',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
  {
    files: ['frontend/src/**/*.{ts,tsx}', 'frontend/*.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: ['./frontend/tsconfig.app.json', './frontend/tsconfig.node.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      globals: browserGlobals,
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
    },
    rules: {
      'no-control-regex': 'off',
      'no-undef': 'off',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
];

export default config;

/**
 * Responsabilidades del archivo:
 * - Configurar ESLint en formato flat config.
 * - Separar globals de Node.js y navegador.
 * - Bloquear `any` explicito como regla de calidad del proyecto.
 */
