import type { TodoItem } from '@/core'
import { myDayjs } from '@/plugins/dayjs'

/** 获取复选框的优先级样式 */
export function getDoneInputClass(todoItem: Pick<TodoItem, 'priority'>) {
  let cls = 'outline outline-2'
  switch (todoItem.priority) {
    case '高':
      cls += ' outline-red-500'
      break
    case '中':
      cls += ' outline-yellow-500'
      break
    case '低':
      cls += ' outline-blue-500'
      break
    default:
      break
  }
  return cls
}

// 源码内的测试套件
if (import.meta.vitest) {
  const { test, expect } = import.meta.vitest
  test('getDoneInputClass', () => {
    expect(getDoneInputClass({ priority: '低' })).toContain('checkbox-info')
    expect(getDoneInputClass({ priority: '中' })).toContain('checkbox-warning')
    expect(getDoneInputClass({ priority: '高' })).toContain('checkbox-error')
    expect(getDoneInputClass({ priority: undefined })).toContain('checkbox')
  })
}

export function getScheduledStartHtml(todoItem: Pick<TodoItem, 'scheduled_start'>) {
  const scheduled_start = todoItem.scheduled_start

  if (!scheduled_start) {
    return ''
  }

  const time = myDayjs(scheduled_start)

  let clsStr = 'text-sm'
  let str = ''

  const todayStart = myDayjs().startOf('day')
  const tomorrowStart = myDayjs().add(1, 'day').startOf('day')
  const tomorro2Start = myDayjs().add(2, 'day').startOf('day')
  const tomorro3Start = myDayjs().add(3, 'day').startOf('day')
  const yestdayStart = myDayjs().subtract(1, 'day').startOf('day')
  const yestday2Start = myDayjs().subtract(1, 'day').startOf('day')

  if (time.isBefore(yestday2Start)) {
    str = time.format('YYYY-MM-DD')
  } else if (time.isBefore(yestdayStart)) {
    str = '前天'
  } else if (time.isBefore(todayStart)) {
    str = '昨天'
  } else if (time.isBefore(tomorrowStart)) {
    str = '今天'
  } else if (time.isBefore(tomorro2Start)) {
    str = '明天'
  } else if (time.isBefore(tomorro3Start)) {
    str = '后天'
  } else {
    str = time.format('YYYY-MM-DD')
  }

  if (time.isBefore(tomorrowStart)) {
    clsStr += ' text-red-600'
  } else if (time.isBefore(tomorrowStart.add(2, 'day'))) {
    clsStr += ' text-yellow-600'
  } else if (time.isBefore(tomorrowStart.add(7, 'day'))) {
    clsStr += ' text-blue-600'
  } else {
    clsStr += ' text-green-600'
  }

  if (str) {
    return `<span class="${clsStr}">${str}</span>`
  } else {
    return ''
  }
}

/**
 * 获取待办事项的时间
 *
 * @description 今日和已过期的为红色,明后天的为黄色，3-7天为蓝色，7天以上为绿色
 */
export function getTimeHtml(todoItem: Pick<TodoItem, 'scheduled_start' | 'deadline'>): string {
  let field = 'scheduled_start' as keyof Pick<TodoItem, 'scheduled_start' | 'deadline'>
  let fieldValue = null
  // 一般来说，时间顺序为 计划开始 -> 计划结束 -> 截止时间
  const now = myDayjs().toDate()
  // 时间处于计划开始时间之前
  if (todoItem.scheduled_start && todoItem.deadline) {
    if (now < todoItem.scheduled_start && now < todoItem.deadline) {
      if (todoItem.scheduled_start < todoItem.deadline) {
        field = 'scheduled_start'
        fieldValue = todoItem.scheduled_start
      } else {
        field = 'deadline'
        fieldValue = todoItem.deadline
      }
    } else if (now > todoItem.scheduled_start && now < todoItem.deadline) {
      field = 'deadline'
      fieldValue = todoItem.deadline
    } else if (now > todoItem.deadline) {
      field = 'deadline'
      fieldValue = todoItem.deadline
    } else {
      return ''
    }
  } else if (todoItem.scheduled_start) {
    field = 'scheduled_start'
    fieldValue = todoItem.scheduled_start
  } else if (todoItem.deadline) {
    field = 'deadline'
    fieldValue = todoItem.deadline
  } else {
    return ''
  }

  const timeRelText = myDayjs(fieldValue).fromNow()

  let str = ''

  if (field === 'scheduled_start') {
    str = `${timeRelText}开始`
  } else if (field === 'deadline') {
    str = `截止至${timeRelText}`
  }

  let clsStr = 'text-sm'

  const nowDayJs = myDayjs().add(1, 'day').startOf('day')

  if (myDayjs(fieldValue).isBefore(nowDayJs)) {
    clsStr += ' text-red-600'
  } else if (myDayjs(fieldValue).isBefore(nowDayJs.add(2, 'day'))) {
    clsStr += ' text-yellow-600'
  } else if (myDayjs(fieldValue).isBefore(nowDayJs.add(7, 'day'))) {
    clsStr += ' text-blue-600'
  } else {
    clsStr += ' text-green-600'
  }

  if (str) {
    return `<span class="${clsStr}">${str}</span>`
  } else {
    return ''
  }
}

if (import.meta.vitest) {
  const { test, expect, describe } = import.meta.vitest
  const prevWeek = myDayjs().subtract(2, 'week').toDate()
  const yestday = myDayjs().subtract(1, 'day').toDate()
  const now = myDayjs().toDate()
  const tomoarrow = myDayjs().add(1, 'day').toDate()
  const days4 = myDayjs().add(4, 'day').toDate()
  const nextWeek = myDayjs().add(2, 'week').toDate()
  describe('getTime', () => {
    test.each([
      ['无时间', undefined, undefined, ''],
      // 单独的开始时间
      ['开始时间为昨天', yestday, undefined, '<span class="text-sm text-red-600">1天前开始</span>'],
      ['开始时间为今天', now, undefined, '<span class="text-sm text-red-600">1秒前开始</span>'],
      [
        '开始时间为明天',
        tomoarrow,
        undefined,
        '<span class="text-sm text-yellow-600">1天后开始</span>'
      ],
      ['开始时间为4天后', days4, undefined, '<span class="text-sm text-blue-600">4天后开始</span>'],
      [
        '开始时间为下周',
        nextWeek,
        undefined,
        '<span class="text-sm text-green-600">14天后开始</span>'
      ],
      // 单独的截止时间
      [
        '截止时间为昨天',
        undefined,
        yestday,
        '<span class="text-sm text-red-600">截止至1天前</span>'
      ],
      ['截止时间为今天', undefined, now, '<span class="text-sm text-red-600">截止至1秒前</span>'],
      [
        '截止时间为明天',
        undefined,
        tomoarrow,
        '<span class="text-sm text-yellow-600">截止至1天后</span>'
      ],
      [
        '截止时间为4天后',
        undefined,
        days4,
        '<span class="text-sm text-blue-600">截止至4天后</span>'
      ],
      [
        '截止时间为下周',
        undefined,
        nextWeek,
        '<span class="text-sm text-green-600">截止至14天后</span>'
      ],
      // 开始时间和截止时间 正序
      [
        '开始时间为昨天，截止时间为今天',
        tomoarrow,
        nextWeek,
        '<span class="text-sm text-yellow-600">1天后开始</span>'
      ],
      [
        '开始时间为今天，截止时间为明天',
        now,
        tomoarrow,
        '<span class="text-sm text-yellow-600">截止至1天后</span>'
      ],
      [
        '开始时间为明天，截止时间为4天后',
        tomoarrow,
        days4,
        '<span class="text-sm text-yellow-600">1天后开始</span>'
      ],
      [
        '开始时间为4天后，截止时间为下周',
        prevWeek,
        yestday,
        '<span class="text-sm text-red-600">截止至1天前</span>'
      ],
      // 开始时间和截止时间 倒序
      [
        '开始时间为下周，截止时间为4天后',
        nextWeek,
        days4,
        '<span class="text-sm text-blue-600">截止至4天后</span>'
      ],
      [
        '开始时间为4天后，截止时间为昨天',
        days4,
        yestday,
        '<span class="text-sm text-red-600">截止至1天前</span>'
      ],
      [
        '开始时间为昨天，截止时间为上周',
        yestday,
        prevWeek,
        '<span class="text-sm text-red-600">截止至14天前</span>'
      ]
    ])('getTime %# %s', (name, scheduled_start?: Date, deadline?: Date, res?: string) => {
      expect(getTimeHtml({ scheduled_start, deadline })).toBe(res)
    })
  })
}
