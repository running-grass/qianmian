import { RecordId, StringRecordId, Table } from 'surrealdb'

export function toStringRecordId(recordId: RecordId): StringRecordId {
  return new StringRecordId(recordId.toString())
}

export const AccountTable = new Table('account')
export type AccountId = RecordId<'account'>

export type AccountConfig = {
  default_workspace: WorkspaceId
}
export type Account = {
  id: AccountId
  name: string
  config: AccountConfig
}

export type WorkspaceConfig = {
  default_entity_identity: IdentityId
}

export const workspaceTable = new Table('workspace')
export type WorkspaceId = RecordId<'workspace'>
export type Workspace = {
  id: WorkspaceId
  name: string
  config: WorkspaceConfig
}

export const identityTable = new Table('identity')
export type IdentityId = RecordId<'identity'>
export type Identity = {
  /** id */
  id: IdentityId

  slug: string

  /** 名称 */
  name: string

  /** 描述 */
  description: string
}

export const entityTable = new Table('entity')
export const richEntityTable = new Table('rich_entity')

export type EntityId = RecordId<'entity'>
export type Entity = {
  id: EntityId
  identity: IdentityId
  title: string
  content: string
  created_at: Date
  updated_at: Date
  creator: AccountId
  updater: AccountId
}

/**
 * 节点属性的类型
 */
export type AttributeType =
  | 'object'
  | 'string'
  | 'number'
  | 'boolean'
  | 'date'
  | 'datetime'
  | 'enum'

export type AttributeDataType = string | number | boolean | Date

export const attributeTable = new Table('attribute')
export type AttributeId = RecordId<'attribute'>
export type Attribute = {
  id: AttributeId
  slug: string
  name: string
  description: string
  type: AttributeType
  enums: string[]
}

export const relationTable = new Table('relation')
export type RelationId = RecordId<'relation'>
export type Relation = {
  id: RelationId
  slug: string
  name: string
  description: string
  identities: IdentityId[]
}

export const entityAttributesTable = new Table('entity_attributes')
export type EntityAttributesId = RecordId<'entity_attributes'>
export type EntityAttribute = {
  id: EntityAttributesId
  in: EntityId
  out: AttributeId
  data: AttributeDataType
}

export const entityRelationsTable = new Table('entity_relations')
export type EntityRelationsId = RecordId<'entity_relations'>
export type EntityRelation = {
  id: EntityRelationsId
  in: EntityId
  out: EntityId
  relation: RelationId
}
