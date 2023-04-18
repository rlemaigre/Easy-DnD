import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Vue-Easy-DnD",
  description: "A HTML5 drag-and-drop replacement",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'FAQ', link: '/faq' }
    ],

    sidebar: [
      {
        text: 'Examples',
        items: [
          { text: 'Get Started', link: '/get-started' },
          { text: 'Installation', link: '/installation' },
          { text: 'Components', link: '/components' },
          { text: 'Events', link: '/events' },
          { text: 'Advanced Demos', link: '/advanced-demos' },
          { text: 'FAQ', link: '/faq' }
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/rlemaigre/Easy-DnD' }
    ]
  }
})
