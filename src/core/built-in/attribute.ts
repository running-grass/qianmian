import { ref } from 'vue'
import { allAttributeMapBySlug, dataPoolInitPromise } from '../datapool'
import { createAttribute } from '../sql/attribute'
import type { Attribute, AttributeType } from '../table'

const doneAttributeSlug = 'done'
const priorityAttributeSlug = 'priority'
const scheduledStartSlug = 'scheduled_start'
const scheduledEndSlug = 'scheduled_end'
const deadlineSlug = 'deadline'
const themeColorSlug = 'theme_color'
const tagAttributeSlug = 'tag'

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

/** 主题颜色属性 */
export const attributeThemeColor = ref<Readonly<Attribute>>(undefined!)
async function fillThemeColor() {
  attributeThemeColor.value = await getAttributeBySlug(
    themeColorSlug,
    '主题颜色',
    '用于显示定制的主题颜色',
    'color'
  )
}

/** 标签属性 */
export const attributeTag = ref<Readonly<Attribute>>(undefined!)
async function fillTag() {
  attributeTag.value = await getAttributeBySlug(tagAttributeSlug, '标签', '待办事项标签', 'enums', [
    '学习',
    '工作',
    '家庭'
  ])
}

/** 初始化内置属性 */
export async function initBuiltInAttributes() {
  await Promise.all([
    fillTag(),
    fillDone(),
    fillPriority(),
    fillSchduledStart(),
    fillSchduledEnd(),
    fillDeadline(),
    fillThemeColor()
  ])
}
