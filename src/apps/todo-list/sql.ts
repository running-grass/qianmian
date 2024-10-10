import {
  attributeDone,
  attributeDoneTime,
  identityTodoItem,
  createEntity,
  changeAttribute,
  identityTodoList,
  type AttributeDataType,
  type AttributeId,
  type TodoItem,
  type TodoList,
  todoListView,
  todoItemView,
  entityRelationsTable,
  relationBelongToTodoList
} from '@/core'
import { getDb } from '@/core'
import { type EntityId } from '@/core'
import type { RichEntity } from '@/core/type'
import { computedAsync, useLocalStorage } from '@vueuse/core'
import { ref } from 'vue'

export const showDones = useLocalStorage('showDones', true)

export type OrderField =
  | 'priority'
  | 'created_at'
  | 'updated_at'
  | 'title'
  | 'schedule_start'
  | 'schedule_end'
  | 'deadline'

export const orderField = useLocalStorage<OrderField>('orderField', 'priority')

export const allTodoList = ref<ReadonlyArray<TodoList>>([])

export async function refreshAllTodoList() {
  const db = await getDb()
  const list = await db.select<TodoList>(todoListView)
  allTodoList.value = list
}
export const selectedTodoList = ref<RichEntity | null>(null)

const triggerRef = ref<number>(0)

export const todoItemsByList = computedAsync<TodoItem[]>(async () => {
  const _orderField = orderField.value
  const _showDones = showDones.value
  const _trigger = triggerRef.value

  if (_trigger < 0) {
    return []
  }

  let sql = `SELECT * FROM ${todoItemView.tb}`

  sql += ` WHERE true`
  if (!_showDones) {
    sql += ` AND done = false`
  }

  if (selectedTodoList.value) {
    sql += ` AND belong_to.id CONTAINS ${selectedTodoList.value.entity_id}`
  }

  let sqlOrderField = 'created_at'
  switch (_orderField) {
    case 'priority':
      sqlOrderField = 'priority_order'
      break
    case 'created_at':
      sqlOrderField = 'created_at'
      break
    case 'updated_at':
      sqlOrderField = 'updated_at'
      break
    case 'title':
      sqlOrderField = 'title'
      break
    case 'schedule_start':
      sqlOrderField = 'schedule_start'
      break
    case 'schedule_end':
      sqlOrderField = 'schedule_end'
      break
    case 'deadline':
      sqlOrderField = 'deadline'
      break
  }

  sql += ` ORDER BY ${sqlOrderField} DESC`

  console.debug(sql)
  const db = await getDb()

  const [list] = await db.query<[TodoItem[]]>(sql)

  return list
}, [])

export async function triggerTodoItems() {
  triggerRef.value += 1
}

const _inboxTitle = '收集箱'
export const todoListInbox = ref<Readonly<RichEntity>>(undefined!)

async function fillTodoListInbox() {
  const db = await getDb()
  const [res] = await db.query<[RichEntity[]]>(
    'SELECT * FROM rich_entity WHERE title = $title LIMIT 1',
    {
      title: _inboxTitle
    }
  )

  if (res.length !== 1) {
    await createEntity(identityTodoList.value.id, _inboxTitle)

    const [res] = await db.query<[RichEntity[]]>(
      'SELECT * FROM rich_entity WHERE title = $title LIMIT 1',
      {
        title: _inboxTitle
      }
    )

    if (res.length !== 1) {
      throw new Error('Failed to create inbox')
    }

    todoListInbox.value = res[0]
  }

  todoListInbox.value = res[0]
}

export async function initData() {
  await fillTodoListInbox()
}

export async function changeTodoItemAttribute(
  entityId: EntityId,
  attrId: AttributeId,
  data: AttributeDataType | null
) {
  await changeAttribute(null, entityId, attrId, data)

  triggerTodoItems()
}

/**
 * 创建一个新的待办清单
 *
 * @param title 待办清单的标题
 * @returns 新创建的待办清单的 RecordId
 */
export async function createTodoList(title: string): Promise<EntityId> {
  const id = await createEntity(identityTodoList.value.id, title)

  // triggerTodoItems()
  return id
}

/**
 * 创建一个新的待办事项
 *
 * @param title 待办事项的标题
 * @returns 新创建的待办事项的 RecordId
 */
export async function createTodoItem(title: string): Promise<EntityId> {
  const id = await createEntity(identityTodoItem.value.id, title)
  const todoList = selectedTodoList.value ?? todoListInbox.value

  const db = await getDb()
  await db.relate(id, entityRelationsTable.tb, todoList.entity_id, {
    relation: relationBelongToTodoList.value.id
  })

  triggerTodoItems()
  return id
}

/**
 * 更改一个待办事项的完成状态
 *
 * @param todo 待办事项
 * @param done 是否完成
 */
export async function changeTodoItemDone(todo: TodoItem, done: boolean): Promise<void> {
  // todo.doneAttr.data = done
  await changeTodoItemAttribute(todo.entity_id, attributeDone.value.id, done)
  await changeTodoItemAttribute(
    todo.entity_id,
    attributeDoneTime.value.id,
    done ? new Date() : null
  )
}

/**
 * 删除一个待办事项
 *
 * @param nid 待办事项的 RecordId
 */
export async function deleteTodoItem(nid: EntityId): Promise<void> {
  const db = await getDb()
  // 通过调用数据库函数来统一删除节点
  await db.delete(nid)
  triggerTodoItems()
}
