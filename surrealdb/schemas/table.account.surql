-- 定义用户
DEFINE TABLE OVERWRITE account SCHEMAFULL TYPE NORMAL
  PERMISSIONS FOR select, update, delete, create
		WHERE id = $auth.id
	COMMENT "用户表";
DEFINE FIELD OVERWRITE username ON TABLE account TYPE string
	ASSERT string::is::ascii($value) && string::len($value) >= 5
	COMMENT "用户名";

DEFINE FIELD OVERWRITE password ON TABLE account TYPE string PERMISSIONS NONE COMMENT "密码";
DEFINE FIELD OVERWRITE config ON TABLE account FLEXIBLE TYPE object DEFAULT {} COMMENT "用户配置";
DEFINE INDEX OVERWRITE username_uniq ON TABLE account FIELDS username UNIQUE COMMENT "用户名唯一索引";

DEFINE EVENT OVERWRITE auto_create_workspace ON TABLE account
	WHEN $event = "CREATE"
	THEN {
		LET $ws = (CREATE ONLY workspace CONTENT {
			slug: string::slug($after.username) + "-" +  rand::string(4),
			name: string::concat($after.username, "'s workspace")
		});
		UPDATE $after.id MERGE { config: { default_workspace: $ws.id,}, };
		RELATE ($ws.id)->workspace_members->($after.id) SET role = 'admin';
	}
	COMMENT "自动创建工作空间";


DEFINE ACCESS OVERWRITE front_user ON DATABASE TYPE RECORD
	SIGNUP {
		LET $exists = SELECT * FROM account WHERE username == $user;
		IF $exists {
			THROW "用户名已存在";
		};
		LET $reg_user = (CREATE ONLY account CONTENT { username: $user, password: crypto::argon2::generate($pass), });

		RETURN $reg_user;
	}
	SIGNIN {
		LET $findedUser = SELECT * FROM ONLY account WHERE username == $user LIMIT 1;
		IF ($findedUser == NONE) {
			THROW "用户名不存在";
		};

		IF (!crypto::argon2::compare($findedUser.password, $pass)) {
			THROW "密码错误";
		};

		RETURN $findedUser;
	}
	DURATION FOR TOKEN 365d, FOR SESSION 24h
	AUTHENTICATE {
		LET $tokenRecord = fn::get_token_record();
		IF $tokenRecord.revoked = true {
				THROW "This token has been revoked";
		};

		IF (record::exists($tokenRecord)) {
			UPDATE $tokenRecord MERGE {
				last_ip: session::ip(), last_used: time::now()
			};
		} ELSE {
			INSERT INTO token { id: $token.jti, last_used: time::now() };
		};

		RETURN $auth;
	}
;
