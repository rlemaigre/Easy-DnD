import { defineConfig } from 'vitepress';
import { fileURLToPath, URL } from 'node:url';

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'Vue-Easy-DnD',
  description: 'Mouse and touch drag-and-drop components for Vue 3',
  base: '/Easy-DnD/',
  vite: {
    resolve: {
      alias: [
        {
          find: /^vue-easy-dnd$/,
          replacement: fileURLToPath(new URL('../../lib/src/index.ts', import.meta.url))
        }
      ]
    },
    css: {
      preprocessorOptions: {
        scss: {
          api: 'modern-compiler'
        }
      }
    }
  },
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'API', link: '/installation' },
      { text: 'v3 Migration', link: '/changelog' },
      { text: 'Demos', link: '/advanced-demos' },
      { text: 'FAQ', link: '/faq' }
    ],

    sidebar: [
      {
        text: 'Getting Started',
        items: [
          { text: 'Installation', link: '/installation' },
          { text: 'v3 Changelog & Migration', link: '/changelog' },
          { text: 'FAQ', link: '/faq' },
          { text: 'Events / Composables', link: '/events' },
          { text: 'Advanced Demos', link: '/advanced-demos' }
        ]
      },
      {
        text: 'Components',
        items: [
          { text: 'Drag', link: '/components/drag' },
          { text: 'Drop', link: '/components/drop' },
          { text: 'DropList', link: '/components/droplist' },
          { text: 'DropMask', link: '/components/dropmask' }
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/rlemaigre/Easy-DnD' }
    ]
  }
});
