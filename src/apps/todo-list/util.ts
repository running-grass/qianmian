import type { TodoItem } from '@/core'
import { myDayjs } from '@/plugins/dayjs'

/** 获取复选框的优先级样式 */
export function getDoneInputClass(todoItem: Pick<TodoItem, 'priority'>) {
  let cls = 'checkbox checkbox-sm'
  switch (todoItem.priority) {
    case '高':
      cls += ' checkbox-error'
      break
    case '中':
      cls += ' checkbox-warning'
      break
    case '低':
      cls += ' checkbox-info'
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
    expect(getDoneInputClass({ priority: null })).toContain('checkbox')
  })
}

/**
 * 获取待办事项的时间
 *
 * @description 今日和已过期的为红色,明后天的为黄色，3-7天为蓝色，7天以上为绿色
 */
export function getTime(todoItem: Pick<TodoItem, 'scheduled_start' | 'deadline'>): string {
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
      ['无时间', null, null, ''],
      // 单独的开始时间
      ['开始时间为昨天', yestday, null, '<span class="text-sm text-red-600">1天前开始</span>'],
      ['开始时间为今天', now, null, '<span class="text-sm text-red-600">1秒前开始</span>'],
      ['开始时间为明天', tomoarrow, null, '<span class="text-sm text-yellow-600">1天后开始</span>'],
      ['开始时间为4天后', days4, null, '<span class="text-sm text-blue-600">4天后开始</span>'],
      ['开始时间为下周', nextWeek, null, '<span class="text-sm text-green-600">14天后开始</span>'],
      // 单独的截止时间
      ['截止时间为昨天', null, yestday, '<span class="text-sm text-red-600">截止至1天前</span>'],
      ['截止时间为今天', null, now, '<span class="text-sm text-red-600">截止至1秒前</span>'],
      [
        '截止时间为明天',
        null,
        tomoarrow,
        '<span class="text-sm text-yellow-600">截止至1天后</span>'
      ],
      ['截止时间为4天后', null, days4, '<span class="text-sm text-blue-600">截止至4天后</span>'],
      [
        '截止时间为下周',
        null,
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
    ])(
      'getTime %# %s',
      (name, scheduled_start: Date | null, deadline: Date | null, res: string) => {
        expect(getTime({ scheduled_start, deadline })).toBe(res)
      }
    )
  })
}
