import { ref } from 'vue'
import { allAttributeMapBySlug, dataPoolInitPromise } from '../datapool'
import { createAttribute } from '../sql/attribute'
import type { Attribute, AttributeType } from '../table'

const doneAttributeSlug = 'done'
const doneTimeAttributeSlug = 'done_time'
const priorityAttributeSlug = 'priority'
const scheduledStartSlug = 'scheduled_start'
const scheduledEndSlug = 'scheduled_end'
const deadlineSlug = 'deadline'

/** 优先级类型 */
export type TodoItemPriority = '低' | '中' | '高'

/** 优先级可选项列表 */
export const todoItemPriorities: TodoItemPriority[] = ['低', '中', '高']

async function getAttributeBySlug(
  slug: string,
  name: string = '',
  description: string = '',
  type: AttributeType,
  enums: string[] = []
): Promise<Readonly<Attribute>> {
  await dataPoolInitPromise
  const targetAttr = allAttributeMapBySlug.value.get(slug)

  if (!targetAttr) {
    await createAttribute(slug, name, description, type, enums)

    const targetAttrNew = allAttributeMapBySlug.value.get(slug)
    if (!targetAttrNew) {
      throw new Error(`Failed to create ${slug} attribute`)
    }
    return targetAttrNew
  }

  return targetAttr
}

/** 完成状态属性 */
export const attributeDone = ref<Readonly<Attribute>>(undefined!)
async function fillDone() {
  attributeDone.value = await getAttributeBySlug(
    doneAttributeSlug,
    '已完成',
    '待办事项已完成的状态',
    'boolean'
  )
}

/** 完成时间属性 */
export const attributeDoneTime = ref<Readonly<Attribute>>(undefined!)
async function fillDoneTime() {
  attributeDoneTime.value = await getAttributeBySlug(
    doneTimeAttributeSlug,
    '完成时间',
    '待办事项完成的时间',
    'datetime'
  )
}

/** 优先级属性 */
export const attributePriority = ref<Readonly<Attribute>>(undefined!)
async function fillPriority() {
  attributePriority.value = await getAttributeBySlug(
    priorityAttributeSlug,
    '优先级',
    '待办事项优先级',
    'enum',
    todoItemPriorities
  )
}

/** 计划开始时间属性 */
export const attributeSchduledStart = ref<Readonly<Attribute>>(undefined!)
async function fillSchduledStart() {
  attributeSchduledStart.value = await getAttributeBySlug(
    scheduledStartSlug,
    '计划开始时间',
    '计划开始时间',
    'datetime'
  )
}

/** 计划结束时间属性 */
export const attributeSchduledEnd = ref<Readonly<Attribute>>(undefined!)
async function fillSchduledEnd() {
  attributeSchduledEnd.value = await getAttributeBySlug(
    scheduledEndSlug,
    '计划结束时间',
    '计划结束时间',
    'datetime'
  )
}

/** 截止时间属性 */
export const attributeDeadline = ref<Readonly<Attribute>>(undefined!)
async function fillDeadline() {
  attributeDeadline.value = await getAttributeBySlug(
    deadlineSlug,
    '截止时间',
    '截止时间',
    'datetime'
  )
}

/** 初始化内置属性 */
export async function initBuiltInAttributes() {
  await Promise.all([
    fillDone(),
    fillDoneTime(),
    fillPriority(),
    fillSchduledStart(),
    fillSchduledEnd(),
    fillDeadline()
  ])
}
