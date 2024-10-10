
-- 定义对象关系
DEFINE TABLE OVERWRITE entity_relations SCHEMAFULL TYPE RELATION FROM entity TO entity
	PERMISSIONS FOR select, update, delete, create WHERE fn::get_current_workspace() == workspace
	COMMENT "对象关系关系";
DEFINE FIELD OVERWRITE workspace ON TABLE entity_relations TYPE record<workspace>
	DEFAULT fn::get_current_workspace()
	ASSERT record::exists($value)
	COMMENT "对象关系所属工作空间";
DEFINE FIELD OVERWRITE relation ON TABLE entity_relations TYPE record<relation>
	COMMENT "对象关系类型";
DEFINE INDEX OVERWRITE entity_relations_unique ON TABLE entity_relations FIELDS in,out,relation UNIQUE COMMENT "同类型下对象关系关系唯一索引";

DEFINE EVENT OVERWRITE trigger_entity_update ON TABLE entity_relations
	THEN (
		UPDATE entity SET updated_at = time::now() WHERE id == $after.in || id == $before.in || id == $after.out || id == $before.out
	)
	COMMENT "更新对象关系时触发";
