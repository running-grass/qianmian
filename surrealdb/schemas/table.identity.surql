
-- 定义节点身份
DEFINE TABLE OVERWRITE identity SCHEMAFULL TYPE NORMAL
	PERMISSIONS FOR select, update, delete, create WHERE fn::get_current_workspace() == workspace
	COMMENT "对象类型表";
DEFINE FIELD OVERWRITE workspace ON TABLE identity TYPE record<workspace>
	READONLY DEFAULT fn::get_current_workspace()
	ASSERT record::exists($value)
	COMMENT "对象所属工作空间";

DEFINE FIELD OVERWRITE slug ON TABLE identity TYPE string ASSERT string::is::ascii($value) COMMENT "节点类型标识";
DEFINE FIELD OVERWRITE name ON TABLE identity TYPE string	COMMENT "对象类型名称";
DEFINE FIELD OVERWRITE description ON TABLE identity TYPE string DEFAULT ""  COMMENT "对象类型描述";
DEFINE INDEX OVERWRITE slug_uniq ON TABLE identity FIELDS workspace, slug UNIQUE COMMENT "对象类型工作空间内名称唯一索引";
