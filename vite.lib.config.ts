import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    vue(),
    dts({
      entryRoot: 'lib/src',
      include: ['lib/src'],
      outDirs: ['lib/dist'],
      tsconfigPath: './tsconfig.lib.json'
    })
  ],
  publicDir: false,
  build: {
    target: 'es2019',
    sourcemap: true,
    emptyOutDir: true,
    outDir: resolve(import.meta.dirname, 'lib/dist'),
    lib: {
      entry: resolve(import.meta.dirname, 'lib/src/index.ts'),
      name: 'VueEasyDnD',
      cssFileName: 'dnd',
      formats: ['es', 'cjs', 'iife'],
      fileName: (format: string) => ({
        es: 'vue-easy-dnd.mjs',
        cjs: 'vue-easy-dnd.cjs',
        iife: 'vue-easy-dnd.global.js'
      })[format] ?? `vue-easy-dnd.${format}.js`
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
