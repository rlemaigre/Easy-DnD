import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: [
      {
        find: /^vue-easy-dnd$/,
        replacement: fileURLToPath(new URL('./lib/src/index.ts', import.meta.url))
      }
    ]
  },
  test: {
    globals: false,
    environment: 'jsdom',
    include: ['test/**/*.spec.ts'],
    setupFiles: ['./test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text'],
      include: ['lib/src/**/*.ts', 'lib/src/**/*.vue', 'docs/demos/shared/**/*.vue'],
      thresholds: {
        statements: 80,
        branches: 60,
        functions: 75,
        lines: 80
      }
    }
  }
});
