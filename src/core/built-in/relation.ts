import { ref } from 'vue'
import { dataPoolInitPromise, allRelationMapBySlug } from '../datapool'
import type { IdentityId, Relation } from '../table'
import { createRelation } from '../sql/relation'
import { identityTodoList } from './identity'

const relationBelongToTodoListSlug = 'belong_to_todo_list'

async function getRelationBySlug(
  slug: string,
  name: string = '',
  description: string = '',
  identities: IdentityId[] = []
): Promise<Readonly<Relation>> {
  await dataPoolInitPromise

  if (name === '') {
    name = slug
  }

  if (description === '') {
    description = name
  }

  const relation = allRelationMapBySlug.value.get(slug)
  if (!relation) {
    await createRelation(slug, name, description, identities)

    const relationNew = allRelationMapBySlug.value.get(slug)
    if (!relationNew) {
      throw new Error('Failed to create relation')
    }
    return relationNew
  }
  return relation
}

export const relationBelongToTodoList = ref<Readonly<Relation>>(undefined!)
async function fillBelongToTodoList() {
  relationBelongToTodoList.value = await getRelationBySlug(
    relationBelongToTodoListSlug,
    '所属清单',
    '所属的待办事项清单',
    [identityTodoList.value.id]
  )
}

/** 初始化内置身份 */
export async function initBuiltInRelations() {
  await Promise.all([fillBelongToTodoList()])
}
