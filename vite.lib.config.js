import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  publicDir: false,
  build: {
    target: 'es2019',
    sourcemap: true,
    emptyOutDir: true,
    outDir: resolve(import.meta.dirname, 'lib/dist'),
    lib: {
      entry: resolve(import.meta.dirname, 'lib/src/index.js'),
      name: 'VueEasyDnD',
      cssFileName: 'dnd',
      formats: ['es', 'cjs', 'iife'],
      fileName: (format) => ({
        es: 'vue-easy-dnd.mjs',
        cjs: 'vue-easy-dnd.cjs',
        iife: 'vue-easy-dnd.global.js'
      })[format]
    },
    rolldownOptions: {
      external: ['vue'],
      output: {
        globals: {
          vue: 'Vue'
        }
      }
    }
  }
});
