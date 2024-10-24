import { getDb, todoItemView, type EntityId, type TodoItem } from '@/core'
import { RecordId } from 'surrealdb'

/**
 * 肯定返回一个 TodoItem，否则抛异常
 *
 * @param id TodoItem ID
 * @returns TodoItem
 */
export async function getTodoItemById(id: EntityId): Promise<TodoItem> {
  const db = await getDb()

  const rows = await db.select<TodoItem>(new RecordId(todoItemView.tb, id.id))

  if (!rows) {
    throw new Error('Failed to get todo item')
  }
  return rows
}
