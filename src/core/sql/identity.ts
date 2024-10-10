import { refreshIdentityPool } from '../datapool'
import { getDb } from '../db'
import type { Identity } from '../table'

/**
 * 创建一个新的节点类型
 *
 * @param slug 节点类型的标识
 * @param name 节点类型的名称
 * @param description 节点类型的描述
 *
 * @returns 新创建的节点类型
 */
export async function createIdentity(
  slug: string,
  name: string = '',
  description: string = ''
): Promise<Identity> {
  if (name === '') {
    name = slug
  }

  if (description === '') {
    description = name
  }

  const db = await getDb()
  const [res] = await db.insert<Identity, Partial<Identity>>('identity', {
    slug,
    name,
    description
  })

  await refreshIdentityPool()
  return res
}
