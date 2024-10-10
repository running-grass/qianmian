import { type Ref, ref } from 'vue'
import { dataPoolInitPromise, allIdentityMapBySlug } from '../datapool'
import type { Identity } from '../table'
import { createIdentity } from '../sql/identity'

const identityBlankSlug = 'blank'
const identityTodoItemSlug = 'todo_item'
const identityTodoListSlug = 'todo_list'

async function getIdentityBySlug(
  slug: string,
  name: string = '',
  description: string = ''
): Promise<Readonly<Identity>> {
  await dataPoolInitPromise
  if (name === '') {
    name = slug
  }

  if (description === '') {
    description = name
  }

  const ident = allIdentityMapBySlug.value.get(slug)
  if (!ident) {
    // 创建
    await createIdentity(slug, name, description)

    const identNew = allIdentityMapBySlug.value.get(slug)
    if (!identNew) {
      throw new Error('Failed to create todo item identity')
    }
    return identNew
  }
  return ident
}

/** 空白身份 */
export const identityBlank: Ref<Readonly<Identity>> = ref<Identity>(undefined!)
async function fillBlank() {
  identityBlank.value = await getIdentityBySlug(identityBlankSlug, '空白', '初始内置身份')
}

/** 待办事项身份 */
export const identityTodoItem: Ref<Readonly<Identity>> = ref<Identity>(undefined!)

async function fillTodoItem() {
  identityTodoItem.value = await getIdentityBySlug(
    identityTodoItemSlug,
    '待办事项',
    '待办事项，通常位于某个待办事项列表中'
  )
}

/** 待办事项列表身份 */
export const identityTodoList: Ref<Readonly<Identity>> = ref<Identity>(undefined!)
async function fillTodoList() {
  identityTodoList.value = await getIdentityBySlug(
    identityTodoListSlug,
    '待办事项列表',
    '待办事项列表'
  )
}

/** 初始化内置身份 */
export async function initBuiltInIdentities() {
  await Promise.all([fillBlank(), fillTodoItem(), fillTodoList()])
}
