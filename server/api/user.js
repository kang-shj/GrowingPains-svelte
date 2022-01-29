const router = require('express').Router();

/**
 * @api {get} /api/user/user 获取用户信息
 * @apiGroup 用户
 */
router.get("/user", function(req, res) {
  res.send({
      username: "aaa"
  });
});

module.exports = router;