-- 定义对象属性
DEFINE TABLE OVERWRITE attribute SCHEMAFULL TYPE NORMAL
	PERMISSIONS FOR select, update, delete, create WHERE fn::get_current_workspace() == workspace
	COMMENT "对象属性表";
DEFINE FIELD OVERWRITE workspace ON TABLE attribute TYPE record<workspace>
	READONLY DEFAULT fn::get_current_workspace()
	ASSERT record::exists($value) COMMENT "对象属性所属工作空间";
DEFINE FIELD OVERWRITE slug ON TABLE attribute TYPE string ASSERT string::is::ascii($value) COMMENT "对象属性标识";
DEFINE FIELD OVERWRITE name ON TABLE attribute TYPE string COMMENT "对象属性名称";
DEFINE FIELD OVERWRITE description ON TABLE attribute TYPE string DEFAULT "" COMMENT "对象属性描述";
DEFINE FIELD OVERWRITE type ON TABLE attribute
	TYPE "object" | "string" | "number" | "boolean" |  "datetime" | "date" | "enum"
	DEFAULT "string"
	COMMENT "对象属性类型";
DEFINE FIELD OVERWRITE enums ON TABLE attribute TYPE array<string> DEFAULT [] COMMENT "对象属性枚举值";
DEFINE INDEX OVERWRITE slug_uniq ON TABLE attribute FIELDS workspace, slug UNIQUE;
