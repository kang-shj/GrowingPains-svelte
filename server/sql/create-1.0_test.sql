-- source create-1.0.sql

DROP DATABASE IF EXISTS growingpainslib_test;
create database growingpainslib_test;
use growingpainslib_test;

/* 日志表 */
CREATE TABLE gp_journal (
	id INT UNSIGNED AUTO_INCREMENT NOT NULL,
	time DATETIME NOT NULL,						/*时间*/
	userId INT UNSIGNED,						/*用户ID*/
	sql_ VARCHAR(1024) NOT NULL,					/*sql语句*/
	notes VARCHAR(60),							/*注释*/
	PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

/* 用户表 */
CREATE TABLE gp_user (
	id INT UNSIGNED AUTO_INCREMENT NOT NULL,
	name VARCHAR(20) NOT NULL,			/*名字*/
	PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

/* 登陆方式表 */
CREATE TABLE gp_login (
	id INT UNSIGNED AUTO_INCREMENT NOT NULL,
	userId INT UNSIGNED NOT NULL,		/*用户ID*/
	password VARCHAR(20) NOT NULL,		/*密码*/
	FOREIGN KEY (userId) REFERENCES gp_user(id),
	PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

/* 家庭表 */
CREATE TABLE gp_family (
	id INT UNSIGNED AUTO_INCREMENT NOT NULL,
	name VARCHAR(20) NOT NULL,		/*名称*/
	PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

/* 家庭链接表 */
CREATE TABLE gp_link_family (
	id INT UNSIGNED AUTO_INCREMENT NOT NULL,
	userId INT UNSIGNED NOT NULL,					/*用户ID*/
	familyId INT UNSIGNED NOT NULL,				/*家庭ID*/
	FOREIGN KEY (userId) REFERENCES gp_user(id),
	FOREIGN KEY (familyId) REFERENCES gp_family(id),
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

/* 家庭成员表 */
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
	memberId INT UNSIGNED NOT NULL,				/*成员ID*/
	addTime DATETIME NOT NULL,						/*添加时间*/
	operatorId INT UNSIGNED NOT NULL,			/*操作者用户ID*/
	ruleId INT UNSIGNED NOT NULL,					/*规则ID*/
	score INT NOT NULL,									  /*规则后得分*/
	prevId INT UNSIGNED NOT NULL,					/*上一计分ID*/
	nextId INT UNSIGNED NOT NULL,					/*下一计分ID*/
	FOREIGN KEY (memberId) REFERENCES gp_member(id),
	FOREIGN KEY (operatorId) REFERENCES gp_user(id),
	FOREIGN KEY (ruleId) REFERENCES gp_rule(id),
	-- FOREIGN KEY (prevId) REFERENCES gp_scoring(id),
	-- FOREIGN KEY (nextId) REFERENCES gp_scoring(id),
	PRIMARY KEY(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- 添加日志
CREATE PROCEDURE addjournal(
	IN in_userId INT,
	IN in_sql VARCHAR(1024),
	IN in_notes VARCHAR(60)
)
BEGIN
	INSERT INTO gp_journal (time, userId, sql_, notes) VALUES (NOW(), in_userId, in_sql, in_notes);
END;

-- 注册-密码
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

-- 获取登陆信息
-- CREATE PROCEDURE get_user_info(
-- )

-- 登陆-密码
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

-- 链接家庭
CREATE PROCEDURE link_family(
	IN in_userId INT UNSIGNED,
	IN in_familyId INT UNSIGNED,
	OUT out_result INT
)
BEGIN
	-- DECLARE haslink INT DEFAULT 0;
	SELECT id FROM gp_link_family WHERE userId=in_userId INTO out_result;

	IF out_result > 0 THEN
		UPDATE gp_link_family SET familyId=in_familyId WHERE userId=in_userId;
	ELSE
		INSERT INTO gp_link_family (userId, familyId) VALUES (in_userId, in_familyId);
	END IF;

	SELECT out_result;
END;