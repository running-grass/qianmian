
-- 定义令牌
DEFINE TABLE OVERWRITE token SCHEMAFULL TYPE NORMAL
	PERMISSIONS FOR select, update, delete, create
		WHERE account = $auth.id
	COMMENT "令牌表";
DEFINE FIELD OVERWRITE account ON TABLE token TYPE record<account>
	READONLY DEFAULT $auth
	COMMENT "令牌拥有者";
DEFINE FIELD OVERWRITE workspace ON TABLE token TYPE record<workspace>
	DEFAULT fn::get_workspaces()[0]
	ASSERT record::exists($value)
	COMMENT "令牌工作空间";
DEFINE FIELD OVERWRITE expire ON TABLE token TYPE datetime
	READONLY DEFAULT time::from::unix($token.exp)
	COMMENT "令牌有效期";
DEFINE FIELD OVERWRITE revoked ON TABLE token TYPE bool
	DEFAULT false
	COMMENT "令牌是否已撤销";
DEFINE FIELD OVERWRITE last_used ON TABLE token TYPE datetime
	DEFAULT time::now()
	COMMENT "最后使用时间";
DEFINE FIELD OVERWRITE last_ip ON TABLE token TYPE option<string>
	DEFAULT NONE
	ASSERT type::is::none($value) || string::is::ip($value)
	COMMENT "最后使用IP";
DEFINE FIELD OVERWRITE created_at ON TABLE token TYPE datetime READONLY DEFAULT time::now() COMMENT "创建时间";

DEFINE FUNCTION OVERWRITE fn::get_token_record() {
	RETURN type::thing("token", $token.jti);
};
