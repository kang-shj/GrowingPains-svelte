-- source create-1.1.sql

-- use growingpainslib_test;

/* 用户表 */
ALTER TABLE gp_user
	ADD UNIQUE (name)
;

/* 规则表 */
ALTER TABLE gp_rule
	ADD COLUMN remarks VARCHAR(255),
	ADD COLUMN cancel BOOLEAN
;

/* 计分表 */
ALTER TABLE gp_scoring
	ADD COLUMN remarks VARCHAR(255),
	ADD COLUMN cancel BOOLEAN,
	ADD COLUMN compensateId INT UNSIGNED,
	ADD FOREIGN KEY (compensateId) REFERENCES gp_scoring(id)
;