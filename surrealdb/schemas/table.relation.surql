-- 定义对象关系
DEFINE TABLE OVERWRITE relation SCHEMAFULL TYPE NORMAL
	PERMISSIONS FOR select, update, delete, create WHERE fn::get_current_workspace() == workspace
	COMMENT "对象关系表";
DEFINE FIELD OVERWRITE workspace ON TABLE relation TYPE record<workspace>
	READONLY DEFAULT fn::get_current_workspace()
	ASSERT record::exists($value) COMMENT "对象关系所属工作空间";
DEFINE FIELD OVERWRITE slug ON TABLE relation TYPE string ASSERT string::is::ascii($value) COMMENT "对象关系标识";
DEFINE FIELD OVERWRITE name ON TABLE relation TYPE string COMMENT "对象关系名称";
DEFINE FIELD OVERWRITE description ON TABLE relation TYPE string DEFAULT "" COMMENT "对象关系描述";
DEFINE FIELD OVERWRITE identities ON TABLE relation TYPE array<record<identity>> DEFAULT [] COMMENT "允许的目标节点身份";
DEFINE INDEX OVERWRITE slug_uniq ON TABLE relation FIELDS workspace, slug UNIQUE;

DEFINE EVENT OVERWRITE auto_delete_other_record ON TABLE relation
    WHEN $event = "DELETE"
		THEN {
			DELETE entity_relations WHERE relation = $before.id;
		}
		COMMENT "删除关系时触发";
