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
  {
    linterOptions: {
      reportUnusedDisableDirectives: 'error'
    }
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...pluginVue.configs['flat/recommended'],
  {
    files: ['**/*.{ts,tsx,mts,cts,vue}'],
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
      '@stylistic/no-multiple-empty-lines': 'error',
      '@stylistic/semi': 'error',
      '@stylistic/space-before-function-paren': 'error',
      'prefer-const': 'error',
      '@stylistic/object-curly-spacing': ['error', 'always'],
      '@stylistic/quotes': ['error', 'single'],
      '@stylistic/brace-style': ['error', 'stroustrup', { allowSingleLine: true }]
    }
  },
  {
    files: [
      'src/App3.vue',
      'src/App6.vue',
      'src/App8.vue',
      'src/App11.vue',
      'src/App14.vue',
      'src/App16.vue'
    ],
    rules: {
      // These demos intentionally render hard-coded HTML fixture strings.
      'vue/no-v-html': 'off'
    }
  },
  {
    files: ['src/components/Flex.vue'],
    rules: {
      // The recursive mutable-data demo intentionally edits its supplied tree.
      'vue/no-mutating-props': 'off'
    }
  }
];
