DROP DATABASE IF EXISTS growingpainslib_test;
CREATE DATABASE growingpainslib_test;
USE growingpainslib_test;

/* 日志表 */
CREATE TABLE gp_journal (
	id INT UNSIGNED AUTO_INCREMENT NOT NULL,
	time DATETIME NOT NULL,						/*时间*/
	userId INT UNSIGNED,						/*用户ID*/
	sql_ VARCHAR(100) NOT NULL,					/*sql语句*/
	notes VARCHAR(60),							/*注释*/
	PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE PROCEDURE addjournal(
	IN in_userId INT,
	IN in_sql VARCHAR(100),
	IN in_notes VARCHAR(60)
)
BEGIN
	INSERT INTO gp_journal (time, userId, sql_, notes) VALUES (NOW(), in_userId, in_sql, in_notes);
END;

/* 用户表 */
CREATE TABLE gp_user (
	id INT UNSIGNED AUTO_INCREMENT NOT NULL,
	name VARCHAR(20) NOT NULL,			/*名字*/
	PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE gp_login (
	id INT UNSIGNED AUTO_INCREMENT NOT NULL,
	userId INT UNSIGNED NOT NULL,		/*用户ID*/
	password VARCHAR(20) NOT NULL,		/*密码*/
	FOREIGN KEY (userId) REFERENCES gp_user(id),
	PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE PROCEDURE register_password(
	IN in_name VARCHAR(20),
	IN in_password VARCHAR(20),
	OUT out_result INT
)
BEGIN
	DECLARE Count INT DEFAULT 0;
	SELECT COUNT(*) FROM gp_user WHERE name=in_name INTO Count;
	IF Count = 0 THEN
		INSERT INTO gp_user (name) VALUES (in_name);
		SELECT MAX(id) FROM gp_user INTO out_result;
		INSERT INTO gp_login (userId, password) VALUES (out_result, in_password);
		CALL addjournal(out_result,
			CONCAT('INSERT INTO gp_user (name, password) VALUES (''', in_name, ''', in_password);'),
			'Register'
		);
	ELSE
		SET out_result = -1;
	END IF;
	SELECT out_result;
END;

CREATE PROCEDURE login_password(
	IN in_name VARCHAR(20),
	IN in_password VARCHAR(20),
	OUT out_result INT
)
BEGIN
	DECLARE notes VARCHAR(60) DEFAULT "";
	SELECT gp_user.id FROM gp_user,gp_login WHERE gp_user.id=gp_login.userId AND gp_user.name=in_name AND gp_login.password=in_password INTO out_result;
	IF out_result > 0 THEN
		SET notes = 'login ok';
	ELSE
		SET notes = 'login faild';
	END IF;
	CALL addjournal(0,
		CONCAT('SELECT id FROM gp_user WHERE name=''', in_name, ''',password=in_password INTO out_result;'),
		notes
	);
	SELECT out_result;
END;


/* 家庭表 */
CREATE TABLE gp_family (
	id INT UNSIGNED AUTO_INCREMENT NOT NULL,
	name VARCHAR(20) NOT NULL,		/*名称*/
	PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

/* 角色表 */
CREATE TABLE gp_role (
	id INT UNSIGNED AUTO_INCREMENT NOT NULL,
	name VARCHAR(20) NOT NULL,
	PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
INSERT INTO gp_role (name) VALUES ("child");
INSERT INTO gp_role (name) VALUES ("parent");

/* 家庭成员连接表 */
CREATE TABLE gp_member (
	id INT UNSIGNED AUTO_INCREMENT NOT NULL,
	familyId INT UNSIGNED NOT NULL,				/*家庭ID*/
	userId INT UNSIGNED NOT NULL,					/*用户ID*/
	roleId INT UNSIGNED NOT NULL,					/*角色*/
	mark VARCHAR(20) NOT NULL,						/*标记*/
	FOREIGN KEY (familyId) REFERENCES gp_family(id),
	FOREIGN KEY (userId) REFERENCES gp_user(id),
	FOREIGN KEY (roleId) REFERENCES gp_role(id),
	PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

/* 规则表 */
CREATE TABLE gp_rule (
	id INT UNSIGNED AUTO_INCREMENT NOT NULL,
	familyId INT UNSIGNED NOT NULL,			/*家庭ID*/
	description VARCHAR(20) NOT NULL,		/*描述*/
	scoring INT NOT NULL,								/*计分*/
	FOREIGN KEY (familyId) REFERENCES gp_family(id),
	PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

/* 计划表 */
CREATE TABLE gp_plan (
	id INT UNSIGNED AUTO_INCREMENT NOT NULL,
	familyId INT UNSIGNED NOT NULL,				/*家庭ID*/
	userId INT UNSIGNED NOT NULL,					/*用户ID*/
	ruleId INT UNSIGNED NOT NULL,					/*规则ID*/
	FOREIGN KEY (familyId) REFERENCES gp_family(id),
	FOREIGN KEY (userId) REFERENCES gp_user(id),
	FOREIGN KEY (ruleId) REFERENCES gp_rule(id),
	PRIMARY KEY(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

/* 计分表 */
CREATE TABLE gp_scoring (
	id INT UNSIGNED AUTO_INCREMENT NOT NULL,
	userId INT UNSIGNED NOT NULL,					/*用户ID*/
	ruleId INT UNSIGNED NOT NULL,					/*规则ID*/
	scoring INT NOT NULL,									/*规则后分数*/
	prevId INT UNSIGNED NOT NULL,					/*上一计分ID*/
	nextId INT UNSIGNED NOT NULL,					/*下一计分ID*/
	FOREIGN KEY (userId) REFERENCES gp_user(id),
	FOREIGN KEY (ruleId) REFERENCES gp_rule(id),
	FOREIGN KEY (prevId) REFERENCES gp_scoring(id),
	FOREIGN KEY (nextId) REFERENCES gp_scoring(id),
	PRIMARY KEY(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

/* 成员计分连接表 */
CREATE TABLE gp_scoring_member (
	id INT UNSIGNED AUTO_INCREMENT NOT NULL,
	memberId INT UNSIGNED NOT NULL,							/*成员ID*/
	scoringBeginId INT UNSIGNED NOT NULL,				/*计分开始ID*/
	scoringEndId INT UNSIGNED NOT NULL,					/*计分结束ID*/
	FOREIGN KEY (memberId) REFERENCES gp_member(id),
	FOREIGN KEY (scoringBeginId) REFERENCES gp_scoring(id),
	FOREIGN KEY (scoringEndId) REFERENCES gp_scoring(id),
	PRIMARY KEY(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;