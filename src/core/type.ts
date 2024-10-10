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
    // entity_id_str: string
    // identityObj: Identity

    attributes: Map<Attribute, SimpleEntityAttribute>
    relations: Map<Relation, SimpleEntityRelation[]>
  },
  'id'
>
