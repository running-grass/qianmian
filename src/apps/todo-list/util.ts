import type { TodoItem } from '@/core'

export function getDoneInputClass(todoItem: TodoItem) {
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
