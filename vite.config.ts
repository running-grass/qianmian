import { fileURLToPath, URL } from 'node:url'
import fs from 'node:fs'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'
// import { analyzer } from 'vite-bundle-analyzer'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import packageInfo from './package.json'

import { marked } from 'marked'
import * as cheerio from 'cheerio'

const changeLog = fs.readFileSync('./CHANGELOG.md').toString()

const changeLogHTML = marked.parse(changeLog)

let latestUpdateLog = ''

if (typeof changeLogHTML === 'string') {
  const $ = cheerio.load(changeLogHTML)
  let started = false
  for (const el of $('body').children()) {
    if (el.tagName === 'h1') {
      continue
    }

    if (started && el.tagName === 'h2') {
      break
    }

    if (!started && el.tagName === 'h2') {
      started = true
    }

    console.log('el', el.tagName, $(el).html())

    latestUpdateLog += $(el).html()
  }
}

// console.log('versionLog', versionLog)
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
    vueDevTools(),
    AutoImport({
      resolvers: [ElementPlusResolver()]
    }),
    Components({
      resolvers: [ElementPlusResolver()]
    })
    // analyzer()
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  esbuild: {
    define: {
      __APP_VERSION__: JSON.stringify(packageInfo.version),
      __APP_LATEST_UPDATE_LOG__: JSON.stringify(latestUpdateLog)
    },
    drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : []
  },
  build: {
    target: 'esnext'
  }
})
