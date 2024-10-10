import { refreshRelationPool } from '../datapool'
import { getDb } from '../db'
import { relationTable, type IdentityId, type Relation } from '../table'

export async function createRelation(
  slug: string,
  name: string = '',
  description: string = '',
  identities: IdentityId[] = []
): Promise<Relation> {
  if (name === '') {
    name = slug
  }

  if (description === '') {
    description = name
  }

  const db = await getDb()

  const [res] = await db.insert<Relation, Partial<Relation>>(relationTable, {
    slug,
    name,
    description,
    identities
  })

  await refreshRelationPool()
  return res
}
