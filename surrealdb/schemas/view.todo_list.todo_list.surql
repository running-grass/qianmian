-- Todo List
DEFINE TABLE OVERWRITE todo_list  TYPE NORMAL
	AS SELECT
		-- entity attrs
		title
		, content
		, created_at
		, updated_at
		, creator
		, updater
		, workspace
		-- rich_entity attrs
		, entity_id

		-- todo_list attrs
		, attributes.find(|$attr| $attr.out.slug == "theme_color").data ?? NONE as theme_color
		, attributes.find(|$attr| $attr.out.slug == "tag").data ?? [] as tags

	  FROM rich_entity WHERE identity.slug = "todo_list"
	PERMISSIONS
		FOR select WHERE fn::get_current_workspace() == workspace
	COMMENT "待办清单";
