
-- 定义工作空间
DEFINE TABLE OVERWRITE workspace SCHEMAFULL TYPE NORMAL
	PERMISSIONS
		FOR select WHERE array::find(fn::get_workspaces(), id)
		FOR create FULL
	COMMENT "工作空间表";
DEFINE FIELD OVERWRITE name ON TABLE workspace TYPE string COMMENT "工作空间名称";
DEFINE FIELD OVERWRITE slug ON TABLE workspace TYPE string
	ASSERT string::is::ascii($value) && string::len($value) >= 5
	COMMENT "工作空间标识";
DEFINE FIELD OVERWRITE description ON TABLE workspace TYPE string DEFAULT "" COMMENT "工作空间描述";
DEFINE FIELD OVERWRITE config ON TABLE workspace FLEXIBLE TYPE object DEFAULT {} COMMENT "工作空间配置项";

DEFINE INDEX OVERWRITE slug_uniq ON TABLE workspace FIELDS slug UNIQUE COMMENT "工作空间标识唯一索引";

DEFINE EVENT OVERWRITE auto_create_indentity ON TABLE workspace
    WHEN $event = "CREATE"
		THEN {
			LET $ide = (CREATE ONLY identity CONTENT {
				workspace: $after.id,
				slug: "blank",
				name: '空白',
			});
			UPDATE $after.id MERGE { config: { default_entity_identity: $ide.id,}, };
		}
		COMMENT "自动创建工作空间";

DEFINE EVENT OVERWRITE auto_delete_other_record ON TABLE workspace
    WHEN $event = "DELETE"
		THEN {
			DELETE entity WHERE workspace = $before.id;
			DELETE attribute WHERE workspace = $before.id;
			DELETE relation WHERE workspace = $before.id;
		}
		COMMENT "删除工作空间时触发";

DEFINE FUNCTION OVERWRITE fn::get_workspaces() {
	RETURN (SELECT <-workspace_members<-workspace as wss FROM $auth.id )[0].wss || []
} COMMENT "获取当前用户的所有的工作空间" PERMISSIONS FULL;


-- 获取当前工作空间
DEFINE FUNCTION OVERWRITE fn::get_current_workspace() {
	LET $tokenRecord = fn::get_token_record();
	RETURN $tokenRecord.workspace;
} COMMENT "获取当前工作空间" PERMISSIONS FULL;
