import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: '千面空间',
  description: '千面空间的文档',
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: '首页', link: '/' },
      // { text: 'Examples', link: '/markdown-examples' },
      { text: '更新日志', link: '/CHANGELOG.md' }
    ],

    sidebar: [
      {
        text: '使用手册',
        items: [
          { text: '快速入门', link: '/quick-start' },
          { text: '技术细节', link: '/tech' }
        ]
      }
    ],

    socialLinks: [{ icon: 'github', link: 'https://github.com/running-grass/qianmian' }]
  }
})
