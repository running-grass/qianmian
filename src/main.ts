import { createApp } from 'vue'
// import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router/'

/* element-plus 手动导入样式，对于API的组件，自动导入失败 */
import 'element-plus/theme-chalk/el-message-box.css'

import './style.css'

import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/zh-cn'
import updateLocale from 'dayjs/plugin/updateLocale' // ES 2015

dayjs.extend(updateLocale)
dayjs.locale('zh-cn') // 全局使用简体中文
dayjs.updateLocale('zh-cn', {
  relativeTime: {
    future: '%s后',
    past: '%s前',
    s: '1秒',
    m: '1分支',
    mm: '%d分钟',
    h: '1小时',
    hh: '%d小时',
    d: '1天',
    dd: '%d天',
    M: '1个月',
    MM: '%d个月',
    y: '1年',
    yy: '%d年'
  }
})
dayjs.extend(relativeTime)

const app = createApp(App)
// app.use(createPinia())

app.use(router)
app.mount('#app')
