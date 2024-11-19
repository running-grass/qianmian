import { RecordId, StringRecordId, Table } from 'surrealdb'
import { z } from 'zod'

export function toStringRecordId(recordId: RecordId): StringRecordId {
  return new StringRecordId(recordId.toString())
}

export const AccountTable = new Table('account')
export type AccountId = RecordId<'account'>
/** 个人番茄时钟配置 */
export const PomodoroConfigValidator = z.object({
  /** 番茄时长(分钟) */
  pomodoro_time: z.number().int().positive().default(25),

  /** 短休息时长(分钟) */
  short_break_time: z.number().int().positive().default(5),

  /** 长休息时长(分钟) */
  long_break_time: z.number().int().positive().default(15),

  /** 长休息间隔休息数 */
  break_interval: z.number().int().positive().default(4)
})

export type PomodoroConfig = z.infer<typeof PomodoroConfigValidator>

/** 个人配置检验器 */
export const AccountConfigValidator = z.object({
  /** 默认工作空间 */
  default_workspace: z.instanceof(RecordId<'workspace'>),

  /** 番茄时钟配置 */
  pomodoro: PomodoroConfigValidator.default({})
})

/** 个人配置 */
export type AccountConfig = z.infer<typeof AccountConfigValidator>

export const AccountValidator = z.object({
  id: z.instanceof(RecordId<'account'>),
  username: z.string(),
  config: AccountConfigValidator
})
export type Account = z.infer<typeof AccountValidator>

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
  | 'enums'
  | 'color'

export type AttributeDataType = object | string | number | boolean | Date | Array<string>

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

export const entityEventLogTable = new Table('entity_event_log')
export type EntityEventLogId = RecordId<'entity_event_log'>

/** 实体事件 */
export type EntityEventLog = {
  id: EntityEventLogId
  slug: string
  payload: object
  entity: EntityId
  creator: AccountId
  created_at: Date
}
