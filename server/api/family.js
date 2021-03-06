const router = require('express').Router();
const { query, response } = require('express');
const sqlHelper = require("../dao/sqlHelper");
const func = require("../func");

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
    res.json({
      data: out
    });
  });
});

/**
 * @api {get} /api/family/get_roles 获取角色
 * @apiGroup Family
 * @apiSuccess {Object[]} roles 角色列表
 * @apiSuccess {Number} roles.id 角色Id
 * @apiSuccess {String} roles.name 角色名称
 */
router.get("/get_roles", function(req, res) {
  sqlHelper.query(`
    SELECT *
    FROM gp_role
  `, "get_roles").then(out => {
    res.json({
      data: out
    });
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

  var familyId = await queryFamilyId(req.body.familyId, req.body.familyName, "add member");
  if (familyId < 0) {
    res.send({error: ""});
    return;
  }

  if (userId == undefined) {
    var userSet = await sqlHelper.query(`
      SELECT id
      FROM gp_user
      WHERE name='${userName}'
    `, "add member find user id");

    if (userSet.length <= 0) {
      if (func.AddMemberAutoCreateUser) {
        var newUser = await sqlHelper.query(`
          INSERT INTO gp_user (name)
          VALUES ('${userName}');
        `, "add member create user");
        userId = newUser.insertId;
      } else {
        res.send({error: ""});
      }
    } else {
      userId = userSet[0].id;
    }
  }

  var roleSet = await sqlHelper.query(`
    SELECT id
    FROM gp_role
    WHERE name='${role}'
  `, "add member find role id");

  var roleId = 0;
  if (roleSet.length > 0) {
    roleId = roleSet[0].id;
  }

  console.log({familyId});
  console.log({userId});
  console.log({roleId});

  sqlHelper.query(`
    INSERT INTO gp_member (familyId, userId, roleId, mark)
    VALUES (${familyId}, ${userId}, ${roleId}, '${mark}')
  `, "add member").then(out => {
    return sqlHelper.query(`
      SELECT gp_member.id AS id, gp_family.name AS name, gp_role.name AS role, gp_member.mark AS mark
      FROM gp_member
      LEFT JOIN gp_family ON gp_member.familyId=gp_family.id
      LEFT JOIN gp_role ON gp_member.roleId=gp_role.id
      WHERE gp_member.id=${out.insertId}
    `, "add member reject");
  }).then(out => {
    res.send({
      data: out[0]
    });
  });
});

/**
 * @api {get} /api/family/get_member 获取用户所在家庭成员信息
 * @apiGroup Family
 * @apiParam {Number} [userId] 用户Id description
 * @apiParam {Number} [familyId] 家庭Id
 * @apiSuccess {Number} id 成员Id
 * @apiSuccess {Number} familyId 家庭Id
 * @apiSuccess {Number} roleId 角色Id
 * @apiSuccess {String} roleName 角色
 * @apiSuccess {String} mark 标记
 */
router.get("/get_member", function(req, res) {
  var user = req.user.name;

  var familyId = req.query.familyId;
  var userId = req.query.userId || user.id;

  sqlHelper.query(`
    SELECT gp_member.id, gp_family.id AS familyId, gp_role.id AS roleId, gp_role.name AS roleName, gp_member.mark AS mark
    FROM gp_member
    INNER JOIN gp_family ON gp_member.familyId=gp_family.id
    INNER JOIN gp_role ON gp_member.roleId=gp_role.id
    WHERE gp_member.familyId=${familyId} AND gp_member.userId=${userId}
  `, "get member").then(out => {
    res.send({data: out[0]});
  });
});

/**
 * @api {get} /api/family/get_members 获取家庭成员
 * @apiGroup Family
 * @apiUse apiParam_family
 * @apiParam {Number} roleId 角色Id
 * @apiSuccess {Object[]} members 家庭成员列表
 * @apiSuccess {Number} members.memberId 成员Id
 * @apiSuccess {Number} members.userId 用户Id
 * @apiSuccess {String} members.userName 用户名称
 * @apiSuccess {String} members.role 角色
 * @apiSuccess {String} members.mark 标记
 */
router.get("/get_members", async function(req, res) {
  var familyId = await queryFamilyId(req.query.familyId, req.query.familyName, "get members");
  if (familyId < 0) {
    res.send({error: ""});
    return;
  }

  var sql = `
    SELECT gp_member.id, gp_member.userId, gp_user.name AS userName, gp_role.name AS role, gp_member.mark
    FROM gp_member
    INNER JOIN gp_user ON gp_member.userId=gp_user.id
    INNER JOIN gp_role ON gp_member.roleId=gp_role.id
    WHERE gp_member.familyId=${familyId}
  `;

  var roleId = req.query.roleId;
  if (roleId && roleId > 0) {
    sql = sql + ` AND gp_member.roleId=${roleId}`;
  }

  sqlHelper.query(sql, "get members").then(out => {
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
 * @api {post} /api/family/update_rule/:id 更改规则
 * @apiGroup Family
 * @apiParam {Number} id 规则Id
 * @apiParam {String} description 规则描述
 * @apiParam {Number} scoring 规则分数
 * @apiParam {String} remarks 备注
 */
router.post("/update_rule", (req, res) => {
  this.updateRule(Object.assign(
    req.body,
    req.params
  ), "update rule").then(response => {
    res.json({
      data: response
    });
  });
});
var updateRule = function(args, notes = "") {
  return new Promise(async (resolve, reject) => {
    if (args.id === undefined) {
      reject({
        error: ""
      });
    }
  
    var rule = await getRule(args.id, notes + " - query rule");
    if (rule === undefined) {
      reject({
        error: ""
      });
    }
  
    var scoring = args.scoring;
    var updateRuleId;
    if (scoring !== undefined && scoring !== rule.scoring) {
      await cancelRule(args.id, "cancel old rule");
      var result =  await addRule({
        familyId: rule.familyId,
        description: args.description || rule.description,
        scoring: rule.scoring,
        remarks: args.remarks || rule.remarks
      }, notes + " - add update rule");

      updateRuleId = result.insertId;
    } else {
      var update = [];
      if (args.description !== undefined) {
        update.push(`description='${args.description}'`);
      }
      if (args.remarks !== undefined) {
        update.push(`remarks='${args.remarks}'`);
      }
      await sqlHelper.query(`
        UPDATE gp_rule
        SET ${update.join(" ")}
        WHERE id=${args.id}
      `, notes + " - update rule");

      updateRuleId = args.id;
    }

    getRule(updateRuleId, notes + " - get update rule").then(response => {
      console.log(response);
      resolve(response);
    });
  });
}
exports.updateRule = updateRule;

/**
 * @api {post} /api/family/cancel_rule/:id 取消规则
 * @apiGroup Family
 * @apiParam {Number} id 规则Id
 */
router.post("/cancel_rule", async function (req, res) {
  var ruleId = req.params.id || req.body.id;
  await cancelRule(ruleId, "delete rule");
  res.json({
    data: "ok"
  });
});
var cancelRule = function (ruleId, notes = "") {
  return sqlHelper.query(`
    UPDATE gp_rule
    SET cancel=1
    WHERE id=${ruleId}
  `, notes + " - cancel rule");
}
exports.cancelRule = cancelRule;

var addRule = function (args, notes = "") {
  return new Promise((resolve, reject) => {
    sqlHelper.query(`
      INSERT INTO gp_rule (familyId, description, scoring, remarks, cancel)
      VALUES (${args.familyId}, '${args.description}', ${args.scoring}, '${args.remarks}', 0)
    `, notes + " - add rule").then(response => {
      resolve(response);
    });
  });
}

/**
 * @api {get} /api/family/rule/:id 获取规则
 * @apiGroup Family
 * @apiParam {Number} id 规则Id
 * @apiSuccess {String} description 描述
 * @apiSuccess {Number} scoring 分数
 * @apiSuccess {String} remarks 备注
 */
router.get("/rule/:id", (req, res) => {
  getRule(req.params.id).then(response => {
    res.json({
      data: response
    });
  });
});
var getRule = function(ruleId, notes) {
  return new Promise((resolve, reject) => {
    sqlHelper.query(`
      SELECT *
      FROM gp_rule
      WHERE id=${ruleId}
    `, notes || "get rule").then(response => {
      resolve(response[0]);
    });
  });
}
exports.getRule = getRule;

/**
 * @api {get} /api/family/get_rules 获取家庭所有规则
 * @apiGroup Family
 * @apiUse apiParam_family
 * @apiSuccess {Object[]} rules 规则列表
 * @apiSuccess {String} rules.description 描述
 * @apiSuccess {Number} rules.scoring 分数
 * @apiSuccess {String} rules.remarks 备注
 */
router.get("/get_rules", async function(req, res) {
  var familyId = await queryFamilyId(req.query.familyId, req.query.familyName, "add rule");
  if (familyId < 0) {
    res.send({error: ""});
    return;
  }

  sqlHelper.query(`
    SELECT id, description, scoring, remarks
    FROM gp_rule
    WHERE familyId=${familyId}
    ORDER BY description
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
router.get("/delete_rules", function(req, res) {
  
});

/**
 * @api {get} /api/family/:id 获取家庭信息
 * @apiGroup Family
 * @apiParam {Number} [id] 要获取的用户id，不填为获取登录用户
 * @apiSuccess {Object}   data          家庭数据
 * @apiSuccess {String}   data.name     家庭名称
 */
router.get("/:id", function(req, res) {
  getFamily(req, res);
});

router.get("/", function(req, res) {
  getFamily(req, res);
});

var getFamily = function(req, res) {
  var user = req.user.name;
  var id = req.params.id || user.id;

  if (id === undefined) {
    res.json({
      error: "id is undefined"
    });
    return;
  }

  sqlHelper.query(`
    SELECT *
    FROM gp_family
    WHERE id=${id}
  `, "get family info").then(out => {
    if (out.length > 0) {
      res.send({
        data: out[0]
      });
    } else {
      res.json({
        error: "家庭不存在。"
      });
    }
  });
}

// module.exports = router;
exports.router = router;