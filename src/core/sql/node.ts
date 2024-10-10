import { refreshEntityById } from '../datapool'
import { getDb } from '../db'
import {
  entityTable,
  toStringRecordId,
  type IdentityId,
  type Entity,
  type EntityId
} from '../table'

export async function createEntity(
  identityId: IdentityId,
  title: string = '请输入标题'
): Promise<EntityId> {
  const db = await getDb()

  const [created] = await db.insert<Entity, Partial<Entity>>(entityTable, {
    title,
    identity: identityId
  })
  if (!created) throw new Error('Failed to create entity')

  // FIXME 由于live查询暂时不触发create，手动更新节点池
  await refreshEntityById(created.id)

  return created.id
}

export async function updateEntity(
  id: EntityId,
  obj: Partial<Pick<Entity, 'title' | 'content'>>
): Promise<void> {
  const db = await getDb()
  await db.merge(toStringRecordId(id), {
    ...obj,
    updated_at: new Date()
  })
  await refreshEntityById(id)
}
