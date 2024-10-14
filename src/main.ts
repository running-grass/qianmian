import { createApp, nextTick } from 'vue'
import App from './App.vue'
import router from './router/'

/* element-plus 手动导入样式，对于API的组件，自动导入失败 */
import 'element-plus/theme-chalk/el-message-box.css'
import 'element-plus/theme-chalk/el-message.css'
import 'element-plus/theme-chalk/el-dialog.css'

import './style.css'

import posthogPlugin from './plugins/posthog' //import the plugin.
import './plugins/dayjs'

const app = createApp(App)

app.use(posthogPlugin) //install the plugin

app.use(router)
app.mount('#app')

router.afterEach((to, from, failure) => {
  if (!failure) {
    nextTick(() => {
      app.config.globalProperties.$posthog.capture('$pageleave', {
        $current_url: window.location.host + from.fullPath,
        path: from.fullPath
      })
      app.config.globalProperties.$posthog.capture('$pageview', { path: to.fullPath })
    })
  }
})
