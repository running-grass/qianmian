import { Table } from 'surrealdb'
import type { TodoItemPriority } from './built-in'
import type { AccountId, EntityId } from './table'
import type { RichEntity } from './type'

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
  done_time: Date | null
  priority: TodoItemPriority | null
  scheduled_start: Date | null
  scheduled_end: Date | null
  deadline: Date | null

  belong_to: { id: EntityId; title: string }[]
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

  theme_color: string | undefined
}
