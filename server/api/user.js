const router = require('express').Router();
const sqlHelper = require("../dao/sqlHelper");

/**
 * @api {get} /api/user/user 获取用户信息
 * @apiGroup User
 */
router.get("/user", function(req, res) {
  console.log("req.data => ", req.data);
  var user = req.data.name;

  sqlHelper.query(`SELECT * FROM gp_user WHERE id=${user.userId}`).then(out => {
    res.send(out[0]);
  });
});

module.exports = router;