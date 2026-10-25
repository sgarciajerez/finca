import js from '@eslint/js';
import tseslint from 'typescript-eslint';
export default tseslint.config(
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      'designs/**',
      'coverage/**',
      '.angular/**',
      'playwright-report/**',
      'test-results/**',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
  {
    files: ['packages/domain/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            '@angular/*',
            '@finca/application',
            '@finca/ui',
            '@finca/storage',
            'express',
            'node:*',
          ],
        },
      ],
    },
  },
  {
    files: ['packages/application/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        { patterns: ['@angular/*', '@finca/ui', '@finca/storage', 'express', 'node:*'] },
      ],
    },
  },
  {
    files: ['scripts/**/*.mjs'],
    languageOptions: {
      globals: { process: 'readonly', console: 'readonly', Buffer: 'readonly', URL: 'readonly' },
    },
  },
);
