import { StringRecordId, Table } from 'surrealdb'
import { computed, reactive, ref, shallowRef, triggerRef } from 'vue'
import {
  type Attribute,
  type Identity,
  type Entity,
  type EntityAttribute,
  type EntityId,
  type EntityRelation,
  type Relation,
  type Workspace,
  type WorkspaceId,
  type EntityEventLog
} from './table'
import { getDb } from './db'
import type { RichEntity, SimpleEntityAttribute, SimpleEntityRelation } from './type'
import { surrealdbAuthed$ } from './subjects/surrealdbSubject'
import { Subject } from 'rxjs'
import { token } from './storage'

type withIdStr = {
  id_str: string
}

const identityPool_ = reactive(new Map<string, Identity & withIdStr>())
const attributePool_ = reactive(new Map<string, Attribute & withIdStr>())
const relationPool_ = reactive(new Map<string, Relation & withIdStr>())
const entityPool_ = shallowRef(new Map<string, RichEntity>())

/**
 * 节点身份的数据池
 */
type IdentityPool = ReadonlyMap<string, Readonly<Identity & withIdStr>>

/**
 * 节点属性的数据池
 */
type AttributePool = ReadonlyMap<string, Readonly<Attribute & withIdStr>>

/**
 * 节点关系的数据池
 */
type RelationPool = ReadonlyMap<string, Readonly<Relation & withIdStr>>

/**
 * 节点的数据池
 */

export const identityPool: IdentityPool = identityPool_

export const attributePool: AttributePool = attributePool_

export const relationPool: RelationPool = relationPool_

export const entityPool = entityPool_

export async function refreshIdentityPool(): Promise<void> {
  const db = await getDb()
  const [identities] = await db.query<[Identity[]]>('SELECT * FROM identity')
  if (!identities) throw new Error('Failed to get identity')

  const latestIdentityIds = new Set(identities.map((identity) => identity.id.toString()))

  // 删除已经不存在的
  for (const id of identityPool_.keys()) {
    if (!latestIdentityIds.has(id)) {
      identityPool_.delete(id)
    }
  }

  for (const identity of identities) {
    const id_str = identity.id.toString()

    // 如果已经存在
    if (identityPool_.has(id_str)) {
      const existIdentity = identityPool_.get(id_str)!
      existIdentity.name = identity.name
      existIdentity.description = identity.description
    } else {
      // 如果不存在
      identityPool_.set(id_str, {
        id: identity.id,
        id_str,
        slug: identity.slug,
        name: identity.name,
        description: identity.description
      })
    }
  }
}

export async function refreshAttributePool(): Promise<void> {
  const db = await getDb()
  const [attributes] = await db.query<[Attribute[]]>('SELECT * FROM attribute')
  if (!attributes) throw new Error('Failed to get attribute')

  const latestAttributeIds = new Set(attributes.map((attribute) => attribute.id.toString()))

  // 删除已经不存在的
  for (const id of attributePool_.keys()) {
    if (!latestAttributeIds.has(id)) {
      attributePool_.delete(id)
    }
  }

  for (const attribute of attributes) {
    const id_str = attribute.id.toString()

    // 如果已经存在
    if (attributePool_.has(id_str)) {
      const existAttribute = attributePool_.get(id_str)!
      existAttribute.name = attribute.name
      existAttribute.description = attribute.description
      existAttribute.type = attribute.type
      existAttribute.enums = attribute.enums
    } else {
      // 如果不存在
      attributePool_.set(id_str, {
        id: attribute.id,
        id_str,
        slug: attribute.slug,
        name: attribute.name,
        description: attribute.description,
        type: attribute.type,
        enums: attribute.enums
      })
    }
  }
}

export async function refreshRelationPool(): Promise<void> {
  const db = await getDb()
  const [relations] = await db.query<[Relation[]]>('SELECT * FROM relation')
  if (!relations) throw new Error('Failed to get relation')

  const latestRelationIds = new Set(relations.map((relation) => relation.id.toString()))

  // 删除已经不存在的
  for (const id of relationPool_.keys()) {
    if (!latestRelationIds.has(id)) {
      relationPool_.delete(id)
    }
  }

  for (const relation of relations) {
    const id_str = relation.id.toString()

    // 如果已经存在
    if (relationPool_.has(id_str)) {
      const existRelation = relationPool_.get(id_str)!
      existRelation.name = relation.name
      existRelation.description = relation.description
    } else {
      // 如果不存在
      relationPool_.set(id_str, {
        id: relation.id,
        id_str,
        slug: relation.slug,
        name: relation.name,
        description: relation.description,
        identities: relation.identities
      })
    }
  }
}

type EntityQueryResult = Omit<
  Entity & {
    entity_id: EntityId
    attributes: Pick<EntityAttribute, 'id' | 'out' | 'data'>[]
    relations: Pick<EntityRelation, 'id' | 'out' | 'relation'>[]
    event_logs: Pick<EntityEventLog, 'slug' | 'payload' | 'created_at'>[]
  },
  'id'
>

function transformEntity(entityResult: EntityQueryResult): RichEntity {
  const attrMap = new Map<Attribute, SimpleEntityAttribute>()
  for (const attrRes of entityResult.attributes) {
    const attr = attributePool_.get(attrRes.out.toString())
    if (!attr) {
      throw new Error('Attribute not found:' + attrRes.id)
    }

    attrMap.set(attr, {
      id: attrRes.id,
      data: attrRes.data
    })
  }

  const relaMap = new Map<Relation, SimpleEntityRelation[]>()
  for (const relaRes of entityResult.relations) {
    const rela = relationPool_.get(relaRes.relation.toString())
    if (!rela) {
      throw new Error('Relation not found:' + relaRes.id)
    }

    if (!relaMap.has(rela)) {
      relaMap.set(rela, [])
    }

    relaMap.get(rela)!.push({
      id: relaRes.id,
      target: relaRes.out
    })
  }

  return {
    entity_id: entityResult.entity_id,
    // entity_id_str: id_str,
    title: entityResult.title,
    content: entityResult.content,
    created_at: entityResult.created_at,
    updated_at: entityResult.updated_at,
    creator: entityResult.creator,
    updater: entityResult.updater,
    identity: entityResult.identity,
    // identityObj: identityPool_.get(entityResult.identity.toString())!,

    relations: relaMap,
    attributes: attrMap,
    event_logs: entityResult.event_logs
  }
}

function updateRichEntity(richEntity: RichEntity): void {
  const existEntity = entityPool_.value.get(richEntity.entity_id.toString())!
  existEntity.title = richEntity.title
  existEntity.content = richEntity.content

  existEntity.updated_at = richEntity.updated_at
  existEntity.updater = richEntity.updater

  // existEntity.identityObj = richEntity.identityObj

  existEntity.attributes = richEntity.attributes
  existEntity.relations = richEntity.relations
}

function updateOrAddRichEntity(richEntity: RichEntity): void {
  if (entityPool_.value.has(richEntity.entity_id.toString())) {
    updateRichEntity(richEntity)
  } else {
    entityPool_.value.set(richEntity.entity_id.toString(), richEntity)
  }
}

export async function refreshEntityPool(): Promise<void> {
  const db = await getDb()

  const [entities] = await db.query<[EntityQueryResult[]]>(
    'SELECT * FROM rich_entity ORDER BY created_at DESC'
  )
  if (!entities) {
    throw new Error('Failed to get entity')
  }

  const latestEntityIds = new Set(entities.map((entity) => entity.entity_id.toString()))

  // 删除已经不存在的
  for (const id of entityPool_.value.keys()) {
    if (!latestEntityIds.has(id)) {
      entityPool_.value.delete(id)
    }
  }

  for (const entity of entities) {
    const richEntity = transformEntity(entity)
    updateOrAddRichEntity(richEntity)
  }

  triggerRef(entityPool_)
}
const refreshByIdSubject = new Subject<EntityId>()

async function _refreshEntityById(id: EntityId): Promise<void> {
  const richEntity = await getRichEntityById(id)
  updateOrAddRichEntity(richEntity)
  triggerRef(entityPool_)
}
refreshByIdSubject.pipe().subscribe((id) => {
  console.log('refreshByIdSubject', id)
  _refreshEntityById(id)
})

export async function refreshEntityById(id: EntityId): Promise<void> {
  refreshByIdSubject.next(id)
}

export async function getRichEntityById(id: EntityId | StringRecordId): Promise<RichEntity> {
  const db = await getDb()
  const [rows] = await db.query<[EntityQueryResult[]]>(
    'SELECT * FROM rich_entity WHERE entity_id = $id',
    {
      id
    }
  )

  if (rows.length !== 1) {
    throw new Error('Failed to get rich entity: rows.length = ' + rows.length)
  }

  return transformEntity(rows[0])
}

export async function subscribeTable(table: Table, refreshFn: CallableFunction) {
  const db = await getDb()
  const queryUuid = await db.live(table.toString(), async (action, result) => {
    console.debug(`live ${table} ${action}`, result)
    if (action === 'CLOSE') {
      console.error(`close ${table} live`)
      return
    }

    await refreshFn(action, result)
  })

  // 取消订阅
  window.addEventListener('beforeunload', async () => {
    await db.kill(queryUuid)
  })
}

export const currentWorkspace = ref<Workspace>(undefined!)

export let dataPoolInitPromise: Promise<unknown> | null = null
surrealdbAuthed$.subscribe(async (authed) => {
  console.debug('authed', authed)
  if (!authed) {
    dataPoolInitPromise = Promise.reject(new Error('SurrealDB not authed'))
    token.value = null
    return
  }

  const db = await getDb()

  dataPoolInitPromise = Promise.all([
    refreshIdentityPool(),
    refreshAttributePool(),
    refreshRelationPool(),
    db.run<WorkspaceId>('fn::get_current_workspace').then(async (workspaceId) => {
      currentWorkspace.value = await db.select<Workspace>(workspaceId)
    })
  ])
  await dataPoolInitPromise

  // refreshEntityPool()
  // subscribeTable(identityTable, refreshIdentityPool)
  // subscribeTable(attributeTable, refreshAttributePool)
  // subscribeTable(relationTable, refreshRelationPool)
  // subscribeTable(richEntityTable, (action: string, result: { entity_id: EntityId }) => {
  //   // refreshEntityById(result.entity_id)
  // })
})

export const allEntity = computed<Readonly<RichEntity>[]>(() => {
  const arr = []
  for (const entity of entityPool_.value.values()) {
    arr.push(entity)
  }
  return arr
})

export const allIdentity = computed<Readonly<Identity & withIdStr>[]>(() => {
  const arr = []
  for (const identity of identityPool_.values()) {
    arr.push(identity)
  }
  return arr
})

export const allIdentityMapBySlug = computed<ReadonlyMap<string, Readonly<Identity>>>(() => {
  const map = new Map<string, Identity>()
  for (const identity of identityPool_.values()) {
    map.set(identity.slug, identity)
  }
  return map
})

export const allAttribute = computed<Readonly<Attribute & withIdStr>[]>(() => {
  const arr = []
  for (const attribute of attributePool_.values()) {
    arr.push(attribute)
  }
  return arr
})

export const allAttributeMapBySlug = computed<ReadonlyMap<string, Readonly<Attribute>>>(() => {
  const map = new Map<string, Attribute>()
  for (const attribute of attributePool_.values()) {
    map.set(attribute.slug, attribute)
  }
  return map
})

export const allRelation = computed<Readonly<Relation & withIdStr>[]>(() => {
  const arr = []
  for (const relation of relationPool_.values()) {
    arr.push(relation)
  }
  return arr
})

export const allRelationMapBySlug = computed<ReadonlyMap<string, Readonly<Relation>>>(() => {
  const map = new Map<string, Relation>()
  for (const relation of relationPool_.values()) {
    map.set(relation.slug, relation)
  }
  return map
})
