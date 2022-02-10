const router = require('express').Router();
const sqlHelper = require("../dao/sqlHelper");

var queryFamilyId = function(familyId, familyName, notes = "") {
  return new Promise(async (resolve, reject) => {
    if (familyId == undefined && familyName == undefined) {
      resolve(-1);
    }
  
    if (familyId != undefined) {
      resolve(familyId);
    } else {
      familyId = await sqlHelper.query(`
        SELECT id
        FROM gp_family
        WHERE name=${familyName}
      `, notes + " find family id");
      resolve(familyId);
    }
  });
}

/**
 * @apiDefine apiParam_family
 * @apiParam (参数family，二选一) {Number} [familyId] 家庭Id
 * @apiParam (参数family，二选一) {String} [familyName] 家庭名称
 */

/**
 * @api {post} /api/family/create 创建家庭
 * @apiGroup Family
 * @apiParam {String} name 家庭名称
 * @apiSuccess {Number} familyId 家庭Id
 */
router.post("/create", function(req, res) {
  var name = req.body.name;

  sqlHelper.query(`
    INSERT INTO gp_family (name)
    VALUES ('${name}')
  `, "create family").then(out => {
    res.send(out[0]);
  });
});

/**
 * @api {post} /api/family/add_member 添加家庭成员
 * @apiGroup Family
 * @apiUse apiParam_family
 * @apiParam (参数user，二选一) {Number} [userId] 用户Id
 * @apiParam (参数user，二选一) {String} [userName] 用户名称
 * @apiParam {String="parent","child"} role 角色
 * @apiParam {String} mark 标记
 * @apiSuccess {Number} memberId 成员Id
 */
router.post("/add_member", async function(req, res) {
  var user = req.user;

  var userId = req.body.userId;
  var userName = req.body.userName;
  var role = req.body.role;
  var mark = req.body.mark;

  if (userId == undefined && userName == undefined) {
    res.send({error: ""});
    return;
  }
  if (role == undefined) {
    res.send({error: ""});
    return;
  }
  if (mark == undefined) {
    res.send({error: ""});
    return;
  }

  var familyId = queryFamilyId(req.body.familyId, req.body.familyName, "add member");
  if (familyId < 0) {
    res.send({error: ""});
    return;
  }

  if (userId == undefined) {
    userId = await sqlHelper.query(`
      SELECT id
      FROM gp_user
      WHERE name=${userName}
    `, "add member find user id");
  }

  var roleId = await sqlHelper.query(`
    SELECT id
    FROM gp_role
    WHERE name=${role}
  `, "add member find role id");

  sqlHelper.query(`
    INSERT INTO gp_member (familyId, userId, roleId, mark)
    VALUES (${familyId}, ${userId}, ${roleId}, '${mark}')
  `, "add member").then(out => {
    res.send(out[0]);
  });
});


/**
 * @api {get} /api/family/get_members 获取家庭成员
 * @apiGroup Family
 * @apiUse apiParam_family
 * @apiSuccess {Object[]} members 家庭成员列表
 * @apiSuccess {Number} members.memberId 成员Id
 * @apiSuccess {Number} members.userId 用户Id
 * @apiSuccess {String} members.userName 用户名称
 * @apiSuccess {String} members.role 角色
 * @apiSuccess {String} members.mark 标记
 */
router.get("/get_members", function(req, res) {
  var familyId = queryFamilyId(req.params.familyId, req.params.familyName, "get members");
  if (familyId < 0) {
    res.send({error: ""});
    return;
  }

  sqlHelper.query(`
    SELECT gp_member.id, gp_member.userId, gp_user.name AS userName, gp_role.name AS role, gp_member.mark
    FROM gp_member
    INNER JOIN gp_user ON gp_member.userId=gp_user.id
    INNER JOIN gp_role ON gp_member.roleId=gp_role.id
    WHERE gp_member.familyId=${familyId}
  `).then(out => {
    res.send({data: out});
  });
});

/**
 * @api {post} /api/family/add_rule 添加规则
 * @apiGroup Family
 * @apiUse apiParam_family
 * @apiParam {String} description 规则描述
 * @apiParam {Number} scoring 规则分数
 */
router.post("/add_rule", async function(req, res) {
  if (req.body.description == undefined) {
    res.send({error: ""});
    return;
  }
  if (req.body.scoring == undefined) {
    res.send({error: ""});
    return;
  }
  var familyId = await queryFamilyId(req.body.familyId, req.body.familyName, "add rule");
  if (familyId < 0) {
    res.send({error: ""});
    return;
  }

  sqlHelper.query(`
    INSERT INTO gp_rule (familyId, description, scoring)
    VALUES (${familyId}, '${req.body.description}', ${req.body.scoring})
  `).then(out => {
    res.send({data: out});
  });

});

/**
 * @api {get} /api/family/get_rules 获取规则
 * @apiGroup Family
 * @apiUse apiParam_family
 * @apiSuccess {Object[]} rules 规则列表
 * @apiSuccess {String} members.description 规则描述
 * @apiSuccess {Number} members.scoring 规则分数
 */
router.get("/get_rules", async function(req, res) {
  var familyId = await queryFamilyId(req.query.familyId, req.query.familyName, "add rule");
  if (familyId < 0) {
    res.send({error: ""});
    return;
  }

  sqlHelper.query(`
    SELECT description, scoring
    FROM gp_rule
    WHERE familyId=${familyId}
  `).then(out => {
    res.send({data: out});
  });
});

/**
 * @api {get} /api/family/del_rule 删除规则
 * @apiGroup Family
 * @apiParam {Number} [familyId] 家庭Id
 * @apiParam {String} [familyName] 家庭名称
 * @apiSuccess {Object[]} rules 规则列表
 * @apiSuccess {String} members.description 规则描述
 * @apiSuccess {Number} members.scoring 规则分数
 */
router.get("/get_rules", function(req, res) {
  
});

module.exports = router;