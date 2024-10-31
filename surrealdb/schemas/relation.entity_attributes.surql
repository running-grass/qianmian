-- 定义对象属性值
DEFINE TABLE OVERWRITE entity_attributes SCHEMAFULL TYPE RELATION FROM entity TO attribute
  PERMISSIONS FOR select, update, delete, create WHERE fn::get_current_workspace() == workspace
  COMMENT "对象属性值关系";
DEFINE FIELD OVERWRITE workspace ON TABLE entity_attributes TYPE record<workspace>
  DEFAULT fn::get_current_workspace()
  ASSERT record::exists($value)
  COMMENT "对象属性值所属工作空间";
DEFINE FIELD OVERWRITE data ON TABLE entity_attributes FLEXIBLE TYPE any
  ASSERT fn::assert_attribute_type($this.out, $value)
  COMMENT "对象属性值";
DEFINE INDEX OVERWRITE entity_attributes_unique ON TABLE entity_attributes FIELDS in,out UNIQUE COMMENT "对象属性值关系唯一索引";

DEFINE EVENT OVERWRITE trigger_entity_update ON TABLE entity_attributes
    THEN (
      UPDATE entity SET updated_at = time::now() WHERE id == $after.in || id == $before.in
    )
  COMMENT "更新对象属性值时触发";

-- 断言属性值是否符合类型声明
DEFINE FUNCTION OVERWRITE fn::assert_attribute_type($aid: record<attribute>, $value: any) {
  -- TODO 需要统一改为 NONE
  IF ($value == null) {
    RETURN true;
  };

  IF ($value == NONE) {
    RETURN true;
  };

  LET $attr = (SELECT * FROM $aid)[0];
  IF (!$attr) {
    THROW "属性不存在";
  };

  IF ($attr.type == "object") {
    RETURN type::is::object($value);
  } ELSE IF ($attr.type == "boolean") {
    RETURN type::is::bool($value);
  } ELSE IF ($attr.type == "number") {
    RETURN type::is::number($value);
  } ELSE IF ($attr.type == "string") {
    RETURN type::is::string($value);
  } ELSE IF ($attr.type == "date") {
    RETURN type::is::datetime($value);
  } ELSE IF ($attr.type == "datetime") {
    RETURN type::is::datetime($value);
  } ELSE IF ($attr.type == "enum") {
    RETURN $value in $attr.enums;
  } ELSE IF ($attr.type == "enums") {
    RETURN type::is::array($value) && array::is_empty(array::complement($value, $attr.enums));
  } ELSE IF ($attr.type == "color") {
    RETURN string::starts_with($value, "#");
  } ELSE {
    THROW "不支持的类型声明[" + <string>$attr.type + "]";
  };
} COMMENT "断言属性值是否符合类型声明" PERMISSIONS FULL;

DEFINE FUNCTION OVERWRITE fn::update_attribute_data($naid: option<record<entity_attributes>>, $nid: record<entity>, $aid: record<attribute>, $data: any) {
  IF (!type::is::none($naid)) {
    UPDATE ONLY $naid MERGE { data: $data };
    RETURN null;
  };
  LET $na = (SELECT * FROM ONLY entity_attributes WHERE in = $nid AND out = $aid LIMIT 1);

  IF ($na) {
    UPDATE ONLY $na.id MERGE { data: $data };
  } ELSE {
    RELATE $nid->entity_attributes->$aid CONTENT { data: $data };
  };

  RETURN null;

} COMMENT "更新属性值" PERMISSIONS FULL;
