import vue from 'rollup-plugin-vue'
import typescript from "rollup-plugin-typescript2";
import commonjs from 'rollup-plugin-commonjs'
import sass from 'rollup-plugin-sass';
import buble from "rollup-plugin-buble";
import dts from "rollup-plugin-dts";
import pkg from './package.json';

const path = require('path');

// On reprend le nom du module à partir de package.json :
const name = pkg.name.split("/")[1];

// Par défaut (tant que rollup-plugin-node-resolve n'est pas utilisé), rollup laisse les dépendances externes
// sous forme d'import MAIS il affiche un warning lors du build avec la liste des dépendances externes. Pour faire
// disparaitre le warning, il faut lister explicitement les packages dont il est normal qu'ils soient traités
// de la sorte. En général, cette liste est déduite des dépendances dans package.json :
const external = Object.keys(pkg.dependencies || {});

export default [
    {
        input: path.resolve(__dirname, './src/index.ts'),
        output: {
            format: 'esm',
            file: path.resolve(__dirname, './dist/' + name + '.esm.js'),
        },
        external: external,
        plugins: [
            vue(),
            commonjs(),
            typescript({clean: true, tsconfig: path.resolve(__dirname, './tsconfig.json')}),
            sass(),
            buble({transforms: {dangerousForOf: true}, objectAssign: 'Object.assign'})
        ]
    },
    {
        input: path.resolve(__dirname, './dist/index.d.ts'),
        output: [{file: path.resolve(__dirname, './dist/' + name + '.d.ts'), format: "es"}],
        plugins: [dts()],
    }
]