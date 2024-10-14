//./plugins/dayjs
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
    m: '1分钟',
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

export const myDayjs = dayjs
