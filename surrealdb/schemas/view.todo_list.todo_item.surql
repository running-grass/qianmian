-- 待办事项
DEFINE TABLE OVERWRITE todo_item  TYPE NORMAL
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

		-- todo_item attrs
		, attributes.find(|$attr| $attr.out.slug == "done").data ?? false as done
		, event_logs.find(|$event_log| $event_log.slug == 'done' && $event_log.payload.type = 'finished').created_at as last_done_time
		, attributes.find(|$attr| $attr.out.slug == "priority").data ?? NONE as priority
		, fn::priority_to_order(attributes.find(|$attr| $attr.out.slug == "priority").data ?? NONE) as priority_order
		, attributes.find(|$attr| $attr.out.slug == "scheduled_start").data ?? NONE as scheduled_start
		, attributes.find(|$attr| $attr.out.slug == "scheduled_end").data ?? NONE as scheduled_end
		, attributes.find(|$attr| $attr.out.slug == "deadline").data ?? NONE as deadline
		, attributes.find(|$attr| $attr.out.slug == "tag").data ?? [] as tags
		, relations.filter(|$rel| $rel.relation.slug == "belong_to_todo_list").map(|$rel| $rel.out)[0].{id,title} as belong_to
		FROM rich_entity WHERE identity.slug = "todo_item"
	PERMISSIONS
		FOR select WHERE fn::get_current_workspace() == workspace
	COMMENT "待办事项";

DEFINE FUNCTION OVERWRITE fn::priority_to_order($priority: option<string>) {
	IF ($priority == "高") {
		RETURN 3;
	} ELSE IF ($priority == "中") {
		RETURN 2;
	} ELSE IF ($priority == "低") {
		RETURN 1;
	} ELSE {
		RETURN 0;
	}
}
COMMENT "待办事项优先级排序" PERMISSIONS NONE;
