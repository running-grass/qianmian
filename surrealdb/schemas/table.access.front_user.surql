
DEFINE ACCESS OVERWRITE front_user ON DATABASE TYPE RECORD
	SIGNUP ( CREATE account CONTENT { username: $user, password: crypto::argon2::generate($pass), })
	SIGNUP {
		LET $exists = SELECT * FROM account WHERE username == $user;
		IF $exists {
			THROW "用户名已存在";
		};
		LET $reg_user = (CREATE ONLY account CONTENT { username: $user, password: crypto::argon2::generate($pass), });

		RETURN $reg_user;
	}
	SIGNIN ( SELECT * FROM account WHERE username == $user AND crypto::argon2::compare(password, $pass) )
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
