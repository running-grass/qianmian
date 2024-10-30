
-- 事件日志
DEFINE TABLE OVERWRITE entity_event_log SCHEMAFULL TYPE NORMAL
	PERMISSIONS FOR select, create WHERE fn::get_current_workspace() == workspace
	COMMENT "实体时间记录";
DEFINE FIELD OVERWRITE workspace ON TABLE entity_event_log TYPE record<workspace>
	READONLY DEFAULT fn::get_current_workspace()
	ASSERT record::exists($value)
	COMMENT "事件所属工作空间";

DEFINE FIELD OVERWRITE slug ON TABLE entity_event_log TYPE string READONLY ASSERT string::is::ascii($value) COMMENT "事件标识";
DEFINE FIELD OVERWRITE created_at ON TABLE entity_event_log TYPE datetime READONLY DEFAULT time::now() COMMENT "创建时间";
DEFINE FIELD OVERWRITE payload ON TABLE entity_event_log FLEXIBLE TYPE object READONLY DEFAULT {} COMMENT "事件数据";
DEFINE FIELD OVERWRITE entity ON TABLE entity_event_log TYPE record<entity> READONLY COMMENT "事件对象";

DEFINE INDEX OVERWRITE slug_idx ON TABLE entity_event_log FIELDS slug COMMENT "事件标识索引";
DEFINE EVENT OVERWRITE trigger_entity_update ON TABLE entity_event_log
	THEN (
		UPDATE entity SET updated_at = time::now() WHERE id == $after.entity
	)
	COMMENT "触发实体的更新";
