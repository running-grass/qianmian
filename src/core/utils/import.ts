import { RecordId } from 'surrealdb'
import { getDb } from '../db'
import {
  attributeTable,
  entityAttributesTable,
  entityRelationsTable,
  entityTable,
  identityTable,
  relationTable,
  type Attribute,
  type AttributeDataType,
  type AttributeId,
  type AttributeType,
  type Entity,
  type EntityAttribute,
  type EntityRelation,
  type Identity,
  type IdentityId,
  type Relation,
  type RelationId
} from '../table'

type ExportIdentityData = {
  id: string

  slug: string

  /** 名称 */
  name: string

  /** 描述 */
  description: string
}

type ExportAttributeData = {
  id: string
  slug: string
  name: string
  description: string
  type: AttributeType
  enums: string[]
}

type ExportRelationData = {
  id: string
  slug: string
  name: string
  description: string
  identities: string[]
}

type ExportEntityData = {
  id: string
  identity: string
  title: string
  content: string
  created_at: string
  updated_at: string
}

type ExportEntityAttributeData = {
  id: string
  in: string
  out: string
  data: string
}

function toAttributeDataType(data: string, type: AttributeType | undefined): AttributeDataType {
  switch (type) {
    case 'string':
    case 'enum':
      return data
    case 'enums':
      return JSON.parse(data)
    case 'number':
      return Number(data)
    case 'boolean':
      return data === 'true'
    case 'date':
    case 'datetime':
      return new Date(data)
    default:
      throw new Error('不支持的类型')
  }
}

type ExportEntityRelationData = {
  id: string
  in: string
  out: string
  relation: string
}

type ExportData = {
  identityTableData: ExportIdentityData[] | undefined
  attributeTableData: ExportAttributeData[] | undefined
  relationTableData: ExportRelationData[] | undefined
  entityTableData: ExportEntityData[] | undefined
  entityAttributeTableData: ExportEntityAttributeData[] | undefined
  entityRelationTableData: ExportEntityRelationData[] | undefined
}

export async function getExportData(): Promise<string> {
  const db = await getDb()
  db.query('SELECT * FROM rich_entity')

  const identityTableData: ExportIdentityData[] = (await db.select<Identity>(identityTable)).map(
    (it) => ({
      id: it.id.id.toString(),
      slug: it.slug,
      name: it.name,
      description: it.description
    })
  )
  const attributeTableData: ExportAttributeData[] = (
    await db.select<Attribute>(attributeTable)
  ).map((it) => ({
    id: it.id.id.toString(),
    slug: it.slug,
    name: it.name,
    description: it.description,
    type: it.type,
    enums: it.enums
  }))
  const relationTableData: ExportRelationData[] = (await db.select<Relation>(relationTable)).map(
    (it) => ({
      id: it.id.id.toString(),
      slug: it.slug,
      name: it.name,
      description: it.description,
      identities: it.identities.map((it) => it.id.toString())
    })
  )

  const entityTableData: ExportEntityData[] = (await db.select<Entity>(entityTable)).map((it) => ({
    id: it.id.id.toString(),
    identity: it.identity.id.toString(),
    title: it.title,
    content: it.content,
    created_at: it.created_at.toJSON(),
    updated_at: it.updated_at.toJSON()
  }))

  const entityAttributeTableData: ExportEntityAttributeData[] = (
    await db.select<EntityAttribute>(entityAttributesTable)
  ).map((it) => ({
    id: it.id.id.toString(),
    in: it.in.id.toString(),
    out: it.out.id.toString(),
    data: JSON.stringify(it.data)
  }))

  const entityRelationTableData: ExportEntityRelationData[] = (
    await db.select<EntityRelation>(entityRelationsTable)
  ).map((it) => ({
    id: it.id.id.toString(),
    in: it.in.id.toString(),
    out: it.out.id.toString(),
    relation: it.relation.id.toString()
  }))

  const exportData: ExportData = {
    identityTableData,

    attributeTableData,
    relationTableData,

    entityTableData,
    entityAttributeTableData,
    entityRelationTableData
  }

  return JSON.stringify(exportData, null, 2)
}

export async function importData(json: string) {
  const importData = JSON.parse(json) as ExportData

  const db = await getDb()

  const {
    attributeTableData,
    identityTableData,
    entityTableData,
    relationTableData,
    entityAttributeTableData,
    entityRelationTableData
  } = importData

  const identityList: Identity[] = (identityTableData ?? []).map((identity) => ({
    id: new RecordId(identityTable.tb, identity.id),
    slug: identity.slug,
    name: identity.name,
    description: identity.description
  }))

  const identityIdMapping = new Map<string, IdentityId>([])

  for (const identity of identityList) {
    const [old] = await db.query<[Identity | undefined]>(
      'SELECT * FROM identity WHERE slug = $slug',
      {
        slug: identity.slug
      }
    )

    if (old) {
      identityIdMapping.set(identity.id.id.toString(), old.id)
    } else {
      await db.create<Identity, Partial<Identity>>(identity.id, identity)
      identityIdMapping.set(identity.id.id.toString(), identity.id)
    }
  }

  const attributeMap = new Map((attributeTableData ?? []).map((it) => [it.id.toString(), it]))

  const attributeList: Attribute[] = (attributeTableData ?? []).map((attribute) => ({
    id: new RecordId(attributeTable.tb, attribute.id),
    slug: attribute.slug,
    name: attribute.name,
    description: attribute.description,
    type: attribute.type,
    enums: attribute.enums
  }))

  const attributeIdMapping = new Map<string, AttributeId>([])
  for (const attribute of attributeList) {
    const [old] = await db.query<[Attribute | undefined]>(
      'SELECT * FROM attribute WHERE slug = $slug',
      {
        slug: attribute.slug
      }
    )

    if (old) {
      attributeIdMapping.set(attribute.id.id.toString(), old.id)
    } else {
      await db.create<Attribute, Partial<Attribute>>(attribute.id, attribute)
      attributeIdMapping.set(attribute.id.id.toString(), attribute.id)
    }
  }

  const relationList: Relation[] = (relationTableData ?? []).map((relation) => ({
    id: new RecordId(relationTable.tb, relation.id),
    slug: relation.slug,
    name: relation.name,
    description: relation.description,
    identities: relation.identities.map((it) => new RecordId(identityTable.tb, it))
  }))

  const relationIdMapping = new Map<string, RelationId>([])

  for (const relation of relationList) {
    const [old] = await db.query<[Relation | undefined]>(
      'SELECT * FROM relation WHERE slug = $slug',
      {
        slug: relation.slug
      }
    )

    if (old) {
      relationIdMapping.set(relation.id.toString(), old.id)
    } else {
      await db.create<Relation, Partial<Relation>>(relation.id, relation)
      relationIdMapping.set(relation.id.toString(), relation.id)
    }
  }

  const entityList: Pick<
    Entity,
    'id' | 'identity' | 'created_at' | 'updated_at' | 'title' | 'content'
  >[] = (entityTableData ?? []).map((entity) => ({
    id: new RecordId(entityTable.tb, entity.id),
    identity: identityIdMapping.get(entity.identity)!,
    title: entity.title,
    content: entity.content,
    created_at: new Date(entity.created_at),
    updated_at: new Date(entity.updated_at)
  }))

  for (const entity of entityList) {
    const old = await db.select<Entity>(entity.id)

    if (!old) {
      await db.create<Entity, Partial<Entity>>(entity.id, entity)
    }
  }

  const entityAttributeList: EntityAttribute[] = (entityAttributeTableData ?? []).map(
    (entityAttribute) => ({
      id: new RecordId(entityAttributesTable.tb, entityAttribute.id),
      in: new RecordId(entityTable.tb, entityAttribute.in),
      out: attributeIdMapping.get(entityAttribute.out)!,
      data: toAttributeDataType(entityAttribute.data, attributeMap.get(entityAttribute.out)?.type)
    })
  )
  for (const entityAttribute of entityAttributeList) {
    const old = await db.select<EntityAttribute>(entityAttribute.id)

    if (!old) {
      await db.create<EntityAttribute, Partial<EntityAttribute>>(
        entityAttribute.id,
        entityAttribute
      )
    }
  }

  const entityRelationList: EntityRelation[] = (entityRelationTableData ?? []).map(
    (entityRelation) => ({
      id: new RecordId(entityRelationsTable.tb, entityRelation.id),
      in: new RecordId(entityTable.tb, entityRelation.in),
      out: new RecordId(entityTable.tb, entityRelation.out),
      relation: relationIdMapping.get(entityRelation.relation)!
    })
  )

  for (const entityRelation of entityRelationList) {
    const old = await db.select<EntityRelation>(entityRelation.id)

    if (!old) {
      await db.create<EntityRelation, Partial<EntityRelation>>(entityRelation.id, entityRelation)
    }
  }
}
