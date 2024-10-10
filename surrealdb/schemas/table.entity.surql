
-- 定义对象
DEFINE TABLE OVERWRITE entity SCHEMAFULL TYPE NORMAL
	PERMISSIONS FOR select, update, delete, create WHERE fn::get_current_workspace() == workspace
	COMMENT "对象表";
DEFINE FIELD OVERWRITE workspace ON TABLE entity TYPE record<workspace>
	READONLY DEFAULT fn::get_current_workspace()
	ASSERT record::exists($value) COMMENT "对象所属工作空间";
DEFINE FIELD OVERWRITE identity ON TABLE entity TYPE record<identity>
	ASSERT record::exists($value) COMMENT "对象类型";
DEFINE FIELD OVERWRITE title ON TABLE entity TYPE string DEFAULT "" COMMENT "对象标题";
DEFINE FIELD OVERWRITE content ON TABLE entity TYPE string DEFAULT ""  COMMENT "对象内容";
DEFINE FIELD OVERWRITE created_at ON TABLE entity TYPE datetime READONLY DEFAULT time::now() COMMENT "对象创建时间";
DEFINE FIELD OVERWRITE updated_at ON TABLE entity TYPE datetime DEFAULT time::now() COMMENT  "对象更新时间";
DEFINE FIELD OVERWRITE creator ON TABLE entity TYPE record<account> READONLY DEFAULT $auth.id COMMENT "对象创建者";
DEFINE FIELD OVERWRITE updater ON TABLE entity TYPE record<account> DEFAULT $auth.id COMMENT "对象更新者";
