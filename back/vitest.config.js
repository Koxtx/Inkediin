import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./tests/setup.js'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'tests/',
        '*.config.js',
        'socket/**'
      ],
      all: true,
      lines: 70,
      functions: 70,
      branches: 70,
      statements: 70
    },
    testTimeout: 10000,
    hookTimeout: 10000
  }
});