import { defineConfig } from 'vitepress';
import type { HeadConfig } from 'vitepress';
import { fileURLToPath, URL } from 'node:url';

const siteUrl = 'https://rlemaigre.github.io/Easy-DnD/';
const siteDescription = 'A lightweight Vue 3 drag-and-drop component library for sortable lists, nested drop zones, touch input, SSR, Nuxt, and TypeScript.';
const socialImageUrl = `${siteUrl}vue-easy-dnd-social.png`;

const canonicalUrl = (relativePath: string) => {
  if (relativePath === 'index.md') return siteUrl;
  return new URL(relativePath.replace(/\.md$/, '.html'), siteUrl).href;
};

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'Vue Easy DnD',
  titleTemplate: ':title | Vue Easy DnD',
  description: siteDescription,
  base: '/Easy-DnD/',
  sitemap: {
    hostname: siteUrl
  },
  head: [
    ['link', { rel: 'icon', href: '/Easy-DnD/favicon.svg', type: 'image/svg+xml' }],
    ['meta', { name: 'theme-color', content: '#6750e8' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:locale', content: 'en_US' }],
    ['meta', { property: 'og:site_name', content: 'Vue Easy DnD' }],
    ['meta', { property: 'og:image', content: socialImageUrl }],
    ['meta', { property: 'og:image:type', content: 'image/png' }],
    ['meta', { property: 'og:image:width', content: '1200' }],
    ['meta', { property: 'og:image:height', content: '630' }],
    ['meta', { property: 'og:image:alt', content: 'Vue Easy DnD — Vue 3 drag and drop library' }],
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
    ['meta', { name: 'twitter:image', content: socialImageUrl }],
    ['meta', { name: 'twitter:image:alt', content: 'Vue Easy DnD — Vue 3 drag and drop library' }]
  ],
  transformHead: ({ pageData, title, description }) => {
    if (pageData.isNotFound) {
      return [['meta', { name: 'robots', content: 'noindex' }]] as HeadConfig[];
    }

    const url = canonicalUrl(pageData.relativePath);
    const head: HeadConfig[] = [
      ['link', { rel: 'canonical', href: url }],
      ['meta', { property: 'og:url', content: url }],
      ['meta', { property: 'og:title', content: title }],
      ['meta', { property: 'og:description', content: description }],
      ['meta', { name: 'twitter:title', content: title }],
      ['meta', { name: 'twitter:description', content: description }]
    ];

    if (pageData.relativePath !== 'index.md') return [...head];

    return [
      ...head,
      ['script', { type: 'application/ld+json' }, JSON.stringify({
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'WebSite',
            '@id': `${siteUrl}#website`,
            url: siteUrl,
            name: 'Vue Easy DnD',
            alternateName: 'Vue-Easy-DnD',
            description: siteDescription
          },
          {
            '@type': 'SoftwareSourceCode',
            '@id': `${siteUrl}#software`,
            url: siteUrl,
            name: 'Vue Easy DnD',
            description: siteDescription,
            codeRepository: 'https://github.com/rlemaigre/Easy-DnD',
            programmingLanguage: ['TypeScript', 'Vue'],
            runtimePlatform: 'Vue 3',
            license: 'https://opensource.org/license/mit'
          }
        ]
      })]
    ];
  },
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
