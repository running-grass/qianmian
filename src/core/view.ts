import { Table } from 'surrealdb'
import type { TodoItemPriority } from './built-in'
import type { EntityId } from './table'
import type { RichEntity } from './type'

export const todoItemView = new Table('todo_item')

export type TodoItem = RichEntity & {
  done: boolean
  done_time: Date | null
  priority: TodoItemPriority | null
  scheduled_start: Date | null
  scheduled_end: Date | null
  deadline: Date | null

  belong_to: { id: EntityId; title: string }[]
}

export const todoListView = new Table('todo_list')
export type TodoList = RichEntity
