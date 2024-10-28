import type {
  Attribute,
  Entity,
  EntityAttribute,
  EntityId,
  EntityRelation,
  Relation
} from './table'

export type SimpleEntityAttribute = Pick<EntityAttribute, 'id' | 'data'>

// 对entityRelation的字段重命名
export type SimpleEntityRelation = {
  id: EntityRelation['id']
  target: EntityRelation['out']
}
export type RichEntity = Omit<
  Entity & {
    entity_id: EntityId

    attributes: Map<Attribute, SimpleEntityAttribute>
    relations: Map<Relation, SimpleEntityRelation[]>
    event_logs: Array<{
      slug: string
      payload: object
      created_at: Date
    }>
  },
  'id'
>
