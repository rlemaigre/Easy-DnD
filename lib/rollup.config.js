import vue from 'rollup-plugin-vue'
import typescript from "rollup-plugin-typescript2";
import commonjs from 'rollup-plugin-commonjs'
import sass from 'rollup-plugin-sass';
import buble from "rollup-plugin-buble";
import copy from "rollup-plugin-cpy";
import pkg from './package.json';

const path = require('path');

// On reprend le nom du module à partir de package.json :
const name = pkg.name;

// Par défaut (tant que rollup-plugin-node-resolve n'est pas utilisé), rollup laisse les dépendances externes
// sous forme d'import MAIS il affiche un warning lors du build avec la liste des dépendances externes. Pour faire
// disparaitre le warning, il faut lister explicitement les packages dont il est normal qu'ils soient traités
// de la sorte. En général, cette liste est déduite des dépendances dans package.json :
const external = Object.keys(pkg.dependencies || {});

const input = path.resolve(__dirname, './src/index.js');

const plugins = [
    commonjs(),
    typescript({clean: true, tsconfig: path.resolve(__dirname, './tsconfig.json')}),
    sass(),
    buble({transforms: {dangerousForOf: true}, objectAssign: 'Object.assign'}),
    copy({
        files: [path.resolve(__dirname, '../README.md')],
        dest: __dirname
    })
];

export default [
    {
        input,
        external,
        plugins: [
            vue(),
            ...plugins
        ],
        output: {
            format: 'esm',
            file: path.resolve(__dirname, './dist/' + name + '.esm.js'),
        },
    },
    {
        input,
        external,
        plugins: [
            vue({template: {optimizeSSR: true}}),
            ...plugins
        ],
        output: {
            format: 'cjs',
            file: path.resolve(__dirname, './dist/' + name + '.ssr.js'),
        },
    },
    {
        input,
        external,
        plugins: [
            vue(),
            ...plugins
        ],
        output: {
            format: 'iife',
            name: "VueEasyDnD",
            file: path.resolve(__dirname, './dist/' + name + '.js'),
        }
    }
]
