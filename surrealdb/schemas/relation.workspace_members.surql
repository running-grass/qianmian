-- 定义关系
DEFINE TABLE OVERWRITE workspace_members SCHEMAFULL TYPE RELATION FROM workspace TO account
	PERMISSIONS
		FOR select WHERE out == $auth.id
		-- FOR create WHERE
		-- TODO 管理员才可以操作
		FOR update, delete, create WHERE false
	COMMENT "工作空间成员关系";
DEFINE FIELD OVERWRITE role ON TABLE workspace_members TYPE "admin" | "member"
	DEFAULT "member"
	COMMENT "工作空间成员角色";
DEFINE INDEX OVERWRITE workspace_members_unique ON TABLE workspace_members FIELDS in,out UNIQUE COMMENT "工作空间成员关系唯一索引";

