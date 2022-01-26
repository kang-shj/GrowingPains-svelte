const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());

/* token 设置与验证 */
const bodyparser = require('body-parser');
app.use(bodyparser.json()); // 使用bodyparder中间件，
app.use(bodyparser.urlencoded({ extended: true }));

const expressJwt = require('express-jwt');
var vertoken = require('./token.js');

const cookieParser = require('cookie-parser');
app.use(cookieParser());

// 解析token获取用户信息
app.use(function(req, res, next) {
    var token = req.cookies.token || req.headers['authorization'];
    if(token == undefined) {
        return next();
    } else {
        vertoken.verToken(token).then((data) => {
            req.data = data;
            return next();
        }).catch((error) => {
            return next();
        });
    }
});

// 验证token是否过期并规定哪些路由不用验证
webUnless = [
    '/',
    '/global.css',
    '/global.css',
    '/favicon.png',
    '/build/bundle.css',
    '/build/bundle.js',
    '/build/bundle.js.map',
];
app.use(expressJwt({
    algorithms: ['HS256'],
    secret: 'growin_pains'
}).unless({
    path: [
        '/api/test',
        '/api/login',
    ].concat(webUnless)
}));

// 当token失效返回提示信息
app.use(function(err, req, res, next) {
    if (err.status == 401) {
        return res.status(401).send('token失效');
    }
});

/* End token*/

/* api */

var api = express.Router();
app.use('/api', api);

api.all('/test', function(req, res) {
    res.send("abcdefg");
});

api.post('/login', function(req, res) {
    console.log(req.body);
    var username = req.body.username;
    var password = req.body.password;
    //生成token
    vertoken.setToken(username, 0).then((data)=>{
        res.cookie("token", data, {maxAge: 60 * 1000, httpOnly: true});
        res.json({token: data});
    });
});

api.use('/user', require('./api/user.js'));

/* End api */

/* web client */

app.use(express.static('public'));
app.use('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'public', 'index.html'));
});

/* End web client */

app.listen(port, () => {
    console.log(`Server is up at port ${port}`);
});