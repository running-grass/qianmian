-- 富实体
DEFINE TABLE OVERWRITE rich_entity  TYPE NORMAL
	AS SELECT
		*
		,id as entity_id
		,->entity_attributes.{id,out,data} as attributes
		,->entity_relations.{id,out,relation} as relations
		,(SELECT slug,payload,created_at FROM entity_event_log WHERE entity == $parent.id) as event_logs

		FROM entity
	PERMISSIONS
		FOR select WHERE fn::get_current_workspace() == workspace
	COMMENT "富节点表";
