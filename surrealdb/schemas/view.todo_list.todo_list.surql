-- Todo List
DEFINE TABLE OVERWRITE todo_list  TYPE NORMAL
	AS SELECT * FROM rich_entity WHERE identity.slug = "todo_list"
	PERMISSIONS
		FOR select WHERE fn::get_current_workspace() == workspace
	COMMENT "待办清单";
