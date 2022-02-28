const router = require('express').Router();
const sqlHelper = require("../dao/sqlHelper");

/**
 * @api {get} /api/user/familys 获取用户家庭列表
 * @apiGroup User
 * @apiSuccess {Object}   familys 家庭列表
 * @apiSuccess {Number}   familys.id    家庭Id
 * @apiSuccess {String}   familys.name    家庭名称
 * @apiSuccess {String}   familys.role    角色
 * @apiSuccess {String}   familys.mark    标记
 */
router.get("/familys", function(req, res) {
  var user = req.user.name;
  console.log({user});

  sqlHelper.query(`
    SELECT gp_family.id, gp_family.name, gp_role.name AS role, gp_member.mark
    FROM gp_member
    INNER JOIN gp_family ON gp_member.familyId=gp_family.id
    INNER JOIN gp_role ON gp_member.roleId=gp_role.id
    WHERE userId=${user.id}
  `, "get user familys").then(out => {
    res.send({data: out});
  });
});

/**
 * @api {get} /api/user/family_link 获取用户当前家庭
 * @apiSuccess {Number}   familyId    家庭Id
 */
router.get("/family_link", function(req, res) {
  var user = req.user.name;

  sqlHelper.query(`
    SELECT *
    FROM gp_link_family
    WHERE userId=${user.id}
  `, "get user family link").then(out => {
    res.json({
      data: out[0]
    });
  });
});

router.post("/link_family", function(req, res) {
  var user = req.user.name;
  // sqlHelper.query(`
  //   INSERT INTO gp_link_family (userId, familyId)
  //   VALUES (${user.id}, ${req.body.familyId})
  // `, "link family").then(out => {
  sqlHelper.query(`CALL link_family(${user.id}, ${req.body.familyId}, @result)`).then(out => {
    var result = out[0][0];
    // console.log({result});
    return sqlHelper.query(`SELECT * FROM gp_link_family WHERE id=${result.out_result}`, "link family reject");
  }).then(out => {
    res.send({
      data: out[0]
    });
  });
});

/**
 * @api {get} /api/user/:id 获取用户信息
 * @apiGroup User
 * @apiParam {Number} [id] 要获取的用户id，不填为获取登录用户
 * @apiSuccess {Object}   data          用户数据
 * @apiSuccess {String}   data.name     用户名称
 */
router.get("/:id", function(req, res) {
  getUser(req, res);
});

router.get("/", function(req, res) {
  getUser(req, res);
});

var getUser = function(req, res) {
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
    FROM gp_user
    WHERE id=${id}
  `, "get user info").then(out => {
  //   sqlHelper.query(`
  //   SELECT gp_user.*, gp_link_family.familyId AS linkFamilyId
  //   FROM gp_user
  //   INNER JOIN gp_link_family ON gp_user.id=gp_link_family.userId
  //   WHERE gp_user.id=${id}
  // `, "get user info").then(out => {

    if (out.length > 0) {
      res.json({
        data: out[0]
      });
    } else {
      res.json({
        error: "用户不存在。"
      });
    }
  });
}

module.exports = router;