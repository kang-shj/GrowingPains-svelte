var router = express.Router();

router.post('/login', function(req, res) {
  console.log(req.body);
  var username = req.body.username;
  var password = req.body.password;
  //生成token
  vertoken.setToken(username, 0).then((data)=>{
      res.json({ token: data });
  })
});

router.get("/user", function(req, res) {
  res.send({
      username: "aaa"
  });
});

module.exports = router;