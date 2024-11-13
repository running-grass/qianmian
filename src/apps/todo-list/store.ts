import {
  attributeDone,
  createEntity,
  changeAttribute,
  identityTodoList,
  type AttributeDataType,
  type AttributeId,
  type TodoList,
  todoListView,
  relationBelongToTodoList,
  StringRecordId,
  type TodoItem,
  ScheduledRepeatValidator,
  type ScheduledRepeat,
  attributeSchduledStart
} from '@/core'
import { getDb } from '@/core'
import { type EntityId } from '@/core'
import { doneEventSlug } from '@/core/built-in/entityEvent'
import { createEntityEventLog } from '@/core/sql/eventLog'
import { myDayjs } from '@/plugins/dayjs'
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

export async function initData() {}

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
  data: AttributeDataType | undefined
) {
  await changeAttribute(undefined, entityId, attrId, data)
}

/**
 * 更改一个待办事项的完成状态
 *
 * @param todo 待办事项
 * @param done 是否完成
 */
export async function changeTodoItemDone(
  todoItem: TodoItem,
  done: boolean,
  type: 'finished' | 'abandoned' = 'finished'
): Promise<void> {
  if (done) {
    await createEntityEventLog(
      doneEventSlug,
      {
        type
      },
      todoItem.entity_id
    )

    if (!todoItem.scheduled_repeat) {
      console.log('done', done)
      // 不需要重复的直接关闭
      await changeTodoItemAttribute(todoItem.entity_id, attributeDone.value.id, done)
    } else if (todoItem.scheduled_start) {
      // 不关闭事项，而是更改下次执行时间
      const nextDate = getNextDate(
        todoItem.scheduled_start,
        ScheduledRepeatValidator.parse(todoItem.scheduled_repeat)
      )
      await changeTodoItemAttribute(todoItem.entity_id, attributeSchduledStart.value.id, nextDate)
    }
  } else {
    await changeTodoItemAttribute(todoItem.entity_id, attributeDone.value.id, done)
  }
}

function getNextDate(current: Date, repeat: ScheduledRepeat): Date {
  const curr = myDayjs(current)
  switch (repeat.unit) {
    case 'days':
      return curr.add(repeat.quantity, 'day').toDate()
    case 'weeks':
      return curr.add(repeat.quantity, 'week').toDate()
    case 'months':
      return curr.add(repeat.quantity, 'month').toDate()
    case 'years':
      return curr.add(repeat.quantity, 'year').toDate()
  }
}

export async function changeBelongListTo(
  todoItemId: EntityId | StringRecordId,
  todoListId: EntityId | StringRecordId | undefined
) {
  const db = await getDb()
  await db.query('DELETE FROM entity_relations WHERE in = $entity AND relation = $relation', {
    entity: todoItemId,
    relation: relationBelongToTodoList.value.id
  })

  if (todoListId === undefined) {
    return
  }

  await db.relate(todoItemId, 'entity_relations', todoListId, {
    relation: relationBelongToTodoList.value.id
  })
}
