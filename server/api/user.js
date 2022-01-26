const router = require('express').Router();

router.get("/user", function(req, res) {
  res.send({
      username: "aaa"
  });
});

module.exports = router;