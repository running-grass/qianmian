import { refreshAttributePool } from '../datapool'
import { getDb } from '../db'
import {
  type AttributeType,
  type Attribute,
  type EntityAttribute,
  type AttributeId,
  type EntityId,
  type EntityAttributesId,
  type AttributeDataType,
  attributeTable
} from '../table'

/**
 * 获取账号的指定状态
 * @param slug 状态名称
 * @returns 状态值
 */
export async function createAttribute(
  slug: string,
  name: string = '',
  description: string = '',
  type: AttributeType,
  enums: string[] = []
): Promise<Attribute> {
  if (name === '') {
    name = slug
  }

  if (description === '') {
    description = name
  }

  const db = await getDb()

  const res = await db.insert<Attribute, Partial<Attribute>>(attributeTable, {
    slug,
    name,
    description,
    type,
    enums: type === 'enum' ? enums : []
  })

  await refreshAttributePool()
  return res[0]
}

export type ObjectAttributeMixin = Pick<EntityAttribute, 'id' | 'data'> & {
  entityId: EntityId
  attributeId: AttributeId
  attributeName: string
  attributeDescription: string
  attributeType: AttributeType
  attributeEnums: string[]
}

type ObjectAttributeQuery = Pick<EntityAttribute, 'id' | 'in' | 'data'> & {
  out: Attribute
}

/**
 * 获取某个对象的所有属性
 * @param oid 对象 ID
 * @returns 属性对象的数组
 */
export async function getAttributesBy(oid: EntityId): Promise<ObjectAttributeMixin[]> {
  const db = await getDb()

  const [res] = await db.query<[ObjectAttributeQuery[]]>(
    'SELECT id, in, data, out FROM entity_attributes WHERE in = $entity FETCH out',
    { entity: oid }
  )

  return res.map(
    ({
      id,
      data,
      in: entityId,
      out: {
        id: attributeId,
        name: attributeName,
        type: attributeType,
        enums: attributeEnums,
        description: attributeDescription
      }
    }) => ({
      id,
      entityId,
      data,
      attributeId,
      attributeName,
      attributeDescription,
      attributeType,
      attributeEnums
    })
  )
}

export async function changeAttribute(
  entityAttributesId: EntityAttributesId | null | undefined,
  entityId: EntityId,
  attrId: AttributeId,
  data: AttributeDataType | null
) {
  const db = await getDb()

  await db.run('fn::update_attribute_data', [
    entityAttributesId ?? undefined,
    entityId,
    attrId,
    data
  ])
}

/**
 * 创建一个对象的属性
 * @param nid 对象 ID
 * @param aid 属性 ID
 */
export async function createAttributes(nid: EntityId, aid: AttributeId) {
  const db = await getDb()
  await db.relate(nid, 'entity_attributes', aid, {
    data: null
  })
}
