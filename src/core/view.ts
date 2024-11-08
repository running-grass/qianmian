import { Table } from 'surrealdb'
import type { ScheduledRepeat, TodoItemPriority } from './built-in'
import type { AccountId, EntityId } from './table'

export const todoItemView = new Table('todo_item')

export type TodoItem = {
  title: string
  content: string
  created_at: Date
  updated_at: Date
  creator: AccountId
  updater: AccountId

  entity_id: EntityId

  done: boolean
  last_done_time?: Date
  priority?: TodoItemPriority
  scheduled_start?: Date
  scheduled_end?: Date
  scheduled_repeat?: ScheduledRepeat
  deadline?: Date
  tags: Array<string>

  belong_to?: { id: EntityId; title: string }
}

export const todoListView = new Table('todo_list')
export type TodoList = {
  title: string
  content: string
  created_at: Date
  updated_at: Date
  creator: AccountId
  updater: AccountId

  entity_id: EntityId

  theme_color?: string
  tags: Array<string>
}
