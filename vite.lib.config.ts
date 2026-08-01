import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    vue(),
    dts({
      root: resolve(import.meta.dirname, 'lib'),
      entryRoot: 'src',
      include: ['src'],
      outDirs: 'dist',
      tsconfigPath: resolve(import.meta.dirname, 'tsconfig.lib.json'),
      bundleTypes: true
    })
  ],
  publicDir: false,
  build: {
    target: 'es2022',
    sourcemap: false,
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
