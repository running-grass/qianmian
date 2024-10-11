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

		, attributes.find(|$attr| $attr.out.slug == "done").data ?? false as done
		, attributes.find(|$attr| $attr.out.slug == "done_time").data ?? null as done_time
		, attributes.find(|$attr| $attr.out.slug == "priority").data ?? null as priority
		, fn::priority_to_order(attributes.find(|$attr| $attr.out.slug == "priority").data ?? null) as priority_order
		, attributes.find(|$attr| $attr.out.slug == "scheduled_start").data ?? null as scheduled_start
		, attributes.find(|$attr| $attr.out.slug == "scheduled_end").data ?? null as scheduled_end
		, attributes.find(|$attr| $attr.out.slug == "deadline").data ?? null as deadline
		, relations.filter(|$rel| $rel.relation.slug == "belong_to_todo_list").map(|$rel| $rel.out).{id,title} as belong_to
		FROM rich_entity WHERE identity.slug = "todo_item"
	PERMISSIONS
		FOR select WHERE fn::get_current_workspace() == workspace
	COMMENT "待办事项";

DEFINE FUNCTION OVERWRITE fn::priority_to_order($priority: string | null) {
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
