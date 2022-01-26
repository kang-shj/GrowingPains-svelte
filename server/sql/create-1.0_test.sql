DROP DATABASE IF EXISTS growingPainslib_test;
CREATE DATABASE growingPainslib_test;
USE growingPainslib_test;

/* 用户表 */
CREATE TABLE gp_user (
	id INT UNSIGNED AUTO_INCREMENT NOT NULL,
	name VARCHAR(20) NOT NULL,		/*名字*/
	PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

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
INSERT INTO gp_role (name) VALUES ("孩子");
INSERT INTO gp_role (name) VALUES ("家长");

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