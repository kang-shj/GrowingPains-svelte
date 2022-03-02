//用于生成和解析token
var jwt = require('jsonwebtoken');
var signkey = 'growin_pains';

exports.setToken = function(username, userid) {
  return new Promise((resolve, reject) => {
    const token = jwt.sign({
      name: username,
      id: userid
    }, signkey, { expiresIn:`${30 * 24}h` });
    resolve(token);
  });
}

exports.verToken = function(token) {
  return new Promise((resolve, reject) => {
    var info = jwt.verify(token.split(' ')[1], signkey);
    resolve(info);
  });
}