import vue from 'rollup-plugin-vue';
import scss from 'rollup-plugin-scss';
import copy from 'rollup-plugin-cpy';
import del from 'rollup-plugin-delete'
import { nodeResolve } from '@rollup/plugin-node-resolve';

const buildName = 'vue-easy-dnd';
const input = 'src/index.js';
const external = ['vue'];
const globals = {
  vue: 'vue'
};

const plugins = [
  del({
    targets: 'dist/*',
    runOnce: true
  }),
  copy({
    files: ['../README.md'],
    dest: 'dist/',
    copyOnce: true
  }),
  scss(),
  nodeResolve()
];

export default [
  // ESM build to be used with webpack/rollup
  {
    input,
    external,
    output: {
      format: 'esm',
      file: `dist/${buildName}.esm.js`,
      globals
    },
    plugins: [
      vue(),
      ...plugins
    ]
  },
  // SSR build
  {
    input,
    external,
    output: {
      format: 'cjs',
      file: `dist/${buildName}.ssr.js`,
      globals
    },
    plugins: [
      vue({ template: { optimizeSSR: true } }),
      ...plugins
    ]
  },
  // Browser build
  {
    input,
    external,
    output: {
      format: 'iife',
      name: 'VueEasyDnD',
      file: `dist/${buildName}.js`,
      globals
    },
    plugins: [
      vue(),
      ...plugins
    ]
  }
]