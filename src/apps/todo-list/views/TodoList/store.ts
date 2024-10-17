import { getDb, todoItemView, type RichEntity, type TodoItem } from '@/core'
import { allTodoList, type OrderField } from '../../store'
import { useLocalStorage } from '@vueuse/core'
import { ref, watch } from 'vue'

/** 选中的待办清单 */
export const selectedTodoList = ref<RichEntity | null>(null)

/** 是否显示已完成的待办事项 */
export const showDones = useLocalStorage('showDones', true)

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

watch(allTodoList, (lists) => {
  // 如果当前选中的不对清单不在里面，则自动取消选中
  const list = lists.find((item) => item.entity_id.id === selectedTodoList.value?.entity_id?.id)

  if (!list) {
    selectedTodoList.value = null
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
