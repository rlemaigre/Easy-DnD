// https://vitepress.dev/reference/site-config
export default {
  title: "Vue-Easy-DnD",
  description: "A HTML5 drag-and-drop replacement",
  base: "/Easy-DnD/",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'API', link: '/installation' },
      { text: 'FAQ', link: '/faq' }
    ],

    sidebar: [
      {
        text: 'Getting Started',
        items: [
          { text: 'Installation', link: '/installation' },
          { text: 'FAQ', link: '/faq' },
          { text: 'Events / Mixins', link: '/events' },
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
}
