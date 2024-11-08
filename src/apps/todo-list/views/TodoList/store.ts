import { getDb, todoItemView, type TodoItem, type TodoList } from '@/core'
import { allTodoList, type OrderField } from '../../store'
import { useLocalStorage } from '@vueuse/core'
import { ref, watch } from 'vue'
import { myDayjs } from '@/plugins/dayjs'

/** 选中的待办清单 */
export const selectedTodoList = ref<
  | TodoList
  | 'all'
  | 'today'
  | 'tomorrow'
  | 'today_done'
  | 'unorganized'
  | 'unscheduled'
  | 'abandoned'
>('today')

/** 是否显示已完成的待办事项 */
export const showDones = useLocalStorage('showDones', false)

/** 设置排序字段 */
export const orderField = useLocalStorage<OrderField>('orderField', 'priority')

/** 待办事项列表 */
export const todoItemsByList = ref<TodoItem[]>([])

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

  let sql = `SELECT *,${sqlOrderField} == NONE as ordered_field_is_none FROM ${todoItemView.tb}`

  sql += ` WHERE true`

  const today = `d"${myDayjs().startOf('day').toJSON()}"`
  const tomorrow = `d"${myDayjs().add(1, 'day').startOf('day').toJSON()}"`
  const tomorrow2 = `d"${myDayjs().add(2, 'day').startOf('day').toJSON()}"`
  switch (selectedTodoList.value) {
    case 'all':
      break
    case 'today':
      // 今天
      sql += ` AND done = false AND ((scheduled_start IS NOT NONE AND scheduled_start < ${tomorrow}) OR (scheduled_end IS NOT NONE AND scheduled_end < ${tomorrow}))`
      break
    case 'tomorrow':
      sql += ` AND done = false AND ((scheduled_start >= ${tomorrow} AND scheduled_start < ${tomorrow2}) OR (scheduled_end >= ${tomorrow} AND scheduled_end < ${tomorrow2}) OR (deadline >= ${tomorrow} AND deadline < ${tomorrow2}))`
      break
    case 'today_done':
      sql += ` AND last_done_time >= ${today}`
      break
    case 'unorganized':
      sql += ` AND done = false AND belong_to IS NONE`
      break
    case 'unscheduled':
      sql += ` AND done = false AND (scheduled_start IS NONE)`
      break
    case 'abandoned':
      sql += ` AND done = true AND entity_id IN (SELECT * FROM entity_event_log WHERE slug = 'done' AND payload.type = 'abandoned').entity`
      break
    default:
      // 今日已完成始终显示已完成的事项
      if (!_showDones) {
        sql += ` AND done = false`
      }
      sql += ` AND belong_to.id = ${selectedTodoList.value.entity_id}`
  }

  switch (selectedTodoList.value) {
    case 'today':
    case 'tomorrow':
      sql += ` ORDER BY priority_order DESC,created_at DESC`
      break
    case 'today_done':
    case 'abandoned':
      sql += ` ORDER BY last_done_time DESC,created_at DESC`
      break
    default:
      sql += ` ORDER BY ordered_field_is_none,${sqlOrderField} ${sqlOrderFieldOrder},created_at DESC`
  }

  // TODO 暂定一个 1000 条的限制
  sql += ` LIMIT 1000`
  console.debug('refreshtodoItems', sql)
  const db = await getDb()

  const [list] = await db.query<[TodoItem[]]>(sql)

  todoItemsByList.value = list
}

watch(allTodoList, (lists) => {
  // 如果当前选中的不对清单不在里面，则自动取消选中
  const list = lists.find(
    (item) =>
      typeof selectedTodoList.value === 'object' &&
      item.entity_id.id === selectedTodoList.value?.entity_id?.id
  )

  if (!list) {
    selectedTodoList.value = 'today'
  }
})

/** 自动更新待办事项列表 */
watch([selectedTodoList, orderField, showDones], refreshtodoItems)

/** 当前选中的待办事项 */
export const selectedTodoItem = ref<TodoItem | null>(null)
watch(todoItemsByList, (items) => {
  // 如果当前选中的事项不在里面，则自动取消选中
  const item = items.find((item) => item.entity_id.id === selectedTodoItem.value?.entity_id?.id)
  selectedTodoItem.value = item ?? null
})
