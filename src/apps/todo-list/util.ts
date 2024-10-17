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

/** 获取待办事项的时间 */
export function getTime(
  todoItem: Pick<TodoItem, 'scheduled_start' | 'scheduled_end' | 'deadline'>
): string {
  let str = ''

  const clsBase = 'text-sm'
  const list = [
    { surfix: '开始', value: todoItem.scheduled_start, cls: 'text-green-600' },
    { surfix: '结束', value: todoItem.scheduled_end, cls: 'text-blue-600' },
    { surfix: '截止', value: todoItem.deadline, cls: 'text-red-600' }
  ]
  list.sort((a, b) => {
    if (!a.value) return 1
    if (!b.value) return -1
    return a.value > b.value ? 1 : -1
  })

  const [{ surfix, value, cls }] = list

  if (value) {
    str += myDayjs(value).fromNow() + surfix
  }

  if (str) {
    return `<span class="${clsBase} ${cls}">${str}</span>`
  } else {
    return ''
  }
}

if (import.meta.vitest) {
  const { test, expect, describe } = import.meta.vitest

  const time1 = myDayjs().subtract(1, 'day').toDate()
  const time2 = myDayjs().toDate()
  const time3 = myDayjs().add(1, 'day').toDate()
  describe('getTime', () => {
    test.each([
      [null, null, null, ''],
      [time1, null, null, '<span class="text-sm text-green-600">1天前开始</span>'],
      [null, time1, null, '<span class="text-sm text-blue-600">1天前结束</span>'],
      [null, null, time1, '<span class="text-sm text-red-600">1天前截止</span>'],
      [time3, null, null, '<span class="text-sm text-green-600">1天后开始</span>'],
      [null, time3, null, '<span class="text-sm text-blue-600">1天后结束</span>'],
      [null, null, time3, '<span class="text-sm text-red-600">1天后截止</span>'],
      [time1, time2, null, '<span class="text-sm text-green-600">1天前开始</span>'],
      [null, time2, time3, '<span class="text-sm text-blue-600">1秒前结束</span>'],
      [time1, null, time3, '<span class="text-sm text-green-600">1天前开始</span>'],
      [time1, time2, time3, '<span class="text-sm text-green-600">1天前开始</span>']
    ])(
      'getTime %#',
      (
        scheduled_start: Date | null,
        scheduled_end: Date | null,
        deadline: Date | null,
        res: string
      ) => {
        expect(getTime({ scheduled_start, scheduled_end, deadline })).toBe(res)
      }
    )
  })
}
