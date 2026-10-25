import { defineConfig } from 'vitest/config';
export default defineConfig({
  test: {
    environment: 'node',
    include: ['packages/**/*.spec.ts', 'apps/**/*.spec.ts'],
    coverage: {
      provider: 'v8',
      include: ['packages/domain/src/**/*.ts', 'packages/application/src/**/*.ts'],
      exclude: ['**/index.ts', '**/*.spec.ts', '**/ports/**'],
      reporter: ['text', 'lcov', 'json-summary'],
      thresholds: { lines: 80, functions: 80, branches: 80, statements: 80 },
    },
  },
});
