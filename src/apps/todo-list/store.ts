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
import { useLocalStorage } from '@vueuse/core'
import { ref, watch } from 'vue'

// 待办清单

/** 待办清单列表 */
export const allTodoList = ref<ReadonlyArray<TodoList>>([])

/** 刷新待办清单列表 */
export async function refreshAllTodoList() {
  const db = await getDb()
  const list = await db.select<TodoList>(todoListView)
  allTodoList.value = list
}

/** 选中的待办清单 */
export const selectedTodoList = ref<RichEntity | null>(null)

watch(allTodoList, (lists) => {
  // 如果当前选中的不对清单不在里面，则自动取消选中
  const list = lists.find((item) => item.entity_id.id === selectedTodoList.value?.entity_id?.id)

  if (!list) {
    selectedTodoList.value = null
  }
})

/** 是否显示已完成的待办事项 */
export const showDones = useLocalStorage('showDones', true)

/** 排序字段 */
export type OrderField =
  | 'priority'
  | 'created_at'
  | 'updated_at'
  | 'title'
  | 'scheduled_start'
  | 'scheduled_end'
  | 'deadline'

/** 设置排序字段 */
export const orderField = useLocalStorage<OrderField>('orderField', 'priority')

/** 待办事项列表 */
export const todoItemsByList = ref<TodoItem[]>([])

/** 自动更新待办事项列表 */
watch([selectedTodoList, orderField, showDones], refreshtodoItems)

/** 触发待办事项列表的更新 */
export async function refreshtodoItems() {
  const _orderField = orderField.value
  const _showDones = showDones.value

  let sqlOrderField = 'created_at'
  let sqlOrderFieldOrder = 'DESC'
  switch (_orderField) {
    case 'priority':
      sqlOrderField = 'priority_order'
      sqlOrderFieldOrder = 'DESC'
      break
    case 'created_at':
      sqlOrderField = 'created_at'
      sqlOrderFieldOrder = 'DESC'
      break
    case 'updated_at':
      sqlOrderField = 'updated_at'
      sqlOrderFieldOrder = 'DESC'
      break
    case 'title':
      sqlOrderField = 'title'
      sqlOrderFieldOrder = 'ASC'
      break
    case 'scheduled_start':
      sqlOrderField = 'scheduled_start'
      sqlOrderFieldOrder = 'ASC'
      break
    case 'scheduled_end':
      sqlOrderField = 'scheduled_end'
      sqlOrderFieldOrder = 'ASC'
      break
    case 'deadline':
      sqlOrderField = 'deadline'
      sqlOrderFieldOrder = 'ASC'
      break
  }

  let sql = `SELECT *,${sqlOrderField} == null as ordered_field_is_null FROM ${todoItemView.tb}`

  sql += ` WHERE true`
  if (!_showDones) {
    sql += ` AND done = false`
  }

  if (selectedTodoList.value) {
    sql += ` AND belong_to.id CONTAINS ${selectedTodoList.value.entity_id}`
  }

  sql += ` ORDER BY ordered_field_is_null,${sqlOrderField} ${sqlOrderFieldOrder},created_at DESC`

  // TODO 暂定一个 1000 条的限制
  sql += ` LIMIT 1000`
  console.debug('refreshtodoItems', sql)
  const db = await getDb()

  const [list] = await db.query<[TodoItem[]]>(sql)

  todoItemsByList.value = list
}

const _inboxTitle = '收集箱'
export const todoListInbox = ref<Readonly<RichEntity>>(undefined!)

async function fillTodoListInbox() {
  const db = await getDb()
  const [res] = await db.query<[RichEntity[]]>(
    'SELECT * FROM rich_entity WHERE title = $title AND identity = $identity LIMIT 1',
    {
      title: _inboxTitle,
      identity: identityTodoList.value.id
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

  refreshtodoItems()
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

  await refreshtodoItems()
  return id
}

/** 当前选中的待办事项 */
export const selectedTodoItem = ref<TodoItem | null>(null)
watch(todoItemsByList, (items) => {
  // 如果当前选中的事项不在里面，则自动取消选中
  const item = items.find((item) => item.entity_id.id === selectedTodoItem.value?.entity_id?.id)
  selectedTodoItem.value = item ?? null
})

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
  refreshtodoItems()
}

/**
 * 删除一个待办清单
 *
 * @param nid 待办清单的 RecordId
 */
export async function deleteTodoList(eid: EntityId): Promise<void> {
  const db = await getDb()
  await db.delete(eid)
  refreshAllTodoList()
}
