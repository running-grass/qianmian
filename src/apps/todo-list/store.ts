import {
  attributeDone,
  attributeDoneTime,
  createEntity,
  changeAttribute,
  identityTodoList,
  type AttributeDataType,
  type AttributeId,
  type TodoItem,
  type TodoList,
  todoListView,
  relationBelongToTodoList,
  StringRecordId
} from '@/core'
import { getDb } from '@/core'
import { type EntityId } from '@/core'
import type { RichEntity } from '@/core/type'
import { computed, ref } from 'vue'

// 待办清单

/** 待办清单列表 */
export const allTodoList = ref<ReadonlyArray<TodoList>>([])

/** 待办清单列表 map */
export const allTodoListMap = computed<ReadonlyMap<string, Readonly<TodoList>>>(() => {
  const map = new Map<string, TodoList>()
  for (const todoList of allTodoList.value) {
    map.set(todoList.entity_id.toString(), todoList)
  }
  return map
})

/** 刷新待办清单列表 */
export async function refreshAllTodoList() {
  const db = await getDb()
  const list = await db.select<TodoList>(todoListView)
  allTodoList.value = list
}

/** 排序字段 */
export type OrderField =
  | 'priority'
  | 'created_at'
  | 'updated_at'
  | 'title'
  | 'scheduled_start'
  | 'scheduled_end'
  | 'deadline'

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
 * 删除一个待办事项
 *
 * @param nid 待办事项的 RecordId
 */
export async function deleteTodoItem(nid: EntityId): Promise<void> {
  const db = await getDb()
  // 通过调用数据库函数来统一删除节点
  await db.delete(nid)
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

export async function changeTodoItemAttribute(
  entityId: EntityId,
  attrId: AttributeId,
  // TODO 逐步取代 null
  data: AttributeDataType | null | undefined
) {
  await changeAttribute(null, entityId, attrId, data)
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

export async function changeBelongListTo(
  todoItemId: EntityId | StringRecordId,
  todoListId: EntityId | StringRecordId
) {
  const db = await getDb()
  await db.query('DELETE FROM entity_relations WHERE in = $entity AND relation = $relation', {
    entity: todoItemId,
    relation: relationBelongToTodoList.value.id
  })

  await db.relate(todoItemId, 'entity_relations', todoListId, {
    relation: relationBelongToTodoList.value.id
  })
}
