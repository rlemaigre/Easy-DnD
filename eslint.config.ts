import js from '@eslint/js';
import stylistic from '@stylistic/eslint-plugin';
import pluginVue from 'eslint-plugin-vue';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default [
  {
    ignores: [
      'dist/**',
      'lib/dist/**',
      'docs/.vitepress/cache/**',
      'docs/.vitepress/dist/**'
    ]
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...pluginVue.configs['flat/recommended'],
  {
    files: ['**/*.{ts,vue}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        parser: tseslint.parser,
        extraFileExtensions: ['.vue']
      },
      globals: {
        ...globals.browser,
        ...globals.node
      }
    },
    plugins: {
      '@stylistic': stylistic
    },
    rules: {
      'vue/multi-word-component-names': 'off',
      'vue/no-unused-vars': 'off',
      'no-prototype-builtins': 'off',
      'vue/no-mutating-props': 'off',
      'vue/max-attributes-per-line': [
        'error',
        {
          singleline: 2,
          multiline: 1
        }
      ],
      'vue/html-self-closing': [
        'error',
        {
          html: {
            void: 'always',
            normal: 'always',
            component: 'always'
          },
          svg: 'always',
          math: 'always'
        }
      ],
      'vue/no-v-html': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      'no-useless-assignment': 'off',
      '@stylistic/no-multiple-empty-lines': 'error',
      '@stylistic/semi': 'error',
      '@stylistic/space-before-function-paren': 'error',
      'prefer-const': 'error',
      '@stylistic/object-curly-spacing': ['error', 'always'],
      '@stylistic/quotes': ['error', 'single'],
      '@stylistic/brace-style': ['error', 'stroustrup', { allowSingleLine: true }]
    }
  }
];
