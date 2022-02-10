// apidoc -- https://apidocjs.com/

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

app.use(function(req, res, next) {
    console.log();
    console.log(`[${req.method}] -- ${req.url}`);
    if (req.method === "GET") {
        console.log("    query => ", req.query);
    } else {
        console.log("    body  => ", req.body);
    }
    next();
})

// 解析token获取用户信息
app.use(function(req, res, next) {
    // console.log("**** begin ****");
    // console.log({req});
    // console.log("headers => ", req.headers);
    // console.log(`cookies.token => ${req.cookies.token}`);
    // console.log(`authorization => ${req.headers['authorization']}`);
    var token = req.cookies.token || req.headers['authorization'];
    console.log({token});
    if (req.headers['authorization'] === undefined) {
        req.headers['authorization'] = token;
    }
    if(token == undefined) {
        return next();
    } else {
        vertoken.verToken(token).then((data) => {
            req.user = data.name;
            console.log(req.user);
            return next();
        }).catch((error) => {
            console.log({error});
            return next();
        });
    }
    // console.log("**** end ****");
    // console.log("");
});

// 验证token是否过期并规定哪些路由不用验证
app.use(expressJwt({
    algorithms: ['HS256'],
    secret: 'growin_pains'
}).unless({
    path: [
        // { url: /^\/[^\/]*\..*/, methods: ['GET'] }, // 根目录下文件 get
        { url: /\/.*\..*/, methods: ['GET'] }, // 任意路径的文件 get
    ].concat([
        '/api/test',
        '/api/register_password',
        '/api/login_password',
    ]).concat([
        '/doc/',
        // { url: /^\/vendor\/.*\..*/, methods: ['GET'] },
        // { url: /^\/img\/.*\..*/, methods: ['GET'] },
        // { url: /^\/css\/.*\..*/, methods: ['GET'] },
        // { url: /^\/locales\/.*\..*/, methods: ['GET'] },
    ]).concat([
        '/',
        // { url: /^\/build\/.*\..*/, methods: ['GET'] },
    ])
}));

// 当token失效返回提示信息
app.use(function(err, req, res, next) {
    if (err.status == 401) {
        return res.status(401).json({
            error: 'token失效'
        });
    }
});

/* End token*/

/* mysql */
const sqlHelper = require("./dao/sqlHelper");
const { VAR_STRING } = require('mysql/lib/protocol/constants/types');
sqlHelper.init({
    host: "cooljie2000.oicp.net",
    port: "3306",
    database: "growingpainslib_test",
}, 'kangsj', 'kjy08191211');
/* End mysql */

/* api */

var api = express.Router();
app.use('/api', api);

api.all('/test', function(req, res) {
    res.send("abcdefg");
});

/**
 * @api {post} /api/register 用户注册
 * @apiGroup User
 * @apiParam {String} username 用户名称
 * @apiParam {String} password 密码
 * @apiSuccess {Number} userId 用户Id
 */
api.post('/register_password', function(req, res) {
    var username = req.body.username;
    var password = req.body.password;

    sqlHelper.query(`CALL register_password('${username}', '${password}', @result)`).then(out => {
        console.log({out});
        var result = out[0][0];
        res.json({userId: result.out_result});
    });
});

/**
 * @api {post} /api/login 用户登录
 * @apiGroup User
 * @apiParam {String} username 用户名称
 * @apiParam {String} password 密码
 */
api.post('/login_password', function(req, res) {
    console.log('req.body => ', req.body);

    var username = req.body.username;
    var password = req.body.password;

    if (username === undefined || username.isEmpty ||
        password === undefined || password.isEmpty
    ) {
        res.json({token: "login error"});
        return;
    } 

    sqlHelper.query(`CALL login_password('${username}', '${password}', @result)`).then(async out => {
        console.log({out});
        var result = out[0][0];
        if (result.out_result > 0) {
            var info = await sqlHelper.query(`
                SELECT * FROM gp_user WHERE id=${result.out_result}
            `);

            sqlHelper.setUserId(result.out_result);
            // //生成token
            vertoken.setToken({
                userId: result.out_result,
                name: username
            }, 0, {
                expiresIn: 60 * 60 * 24 // 授权时效24小时
            }).then((data)=>{
                res.cookie("token", "Bearer " + data, {maxAge: 60 * 1000, httpOnly: true});
                // res.cookie("token", "Bearer " + data);
                res.json({
                    data: info[0],
                    token: data
                });
            });
        } else {
            res.json({token: "login error"});
        }
    });
});

api.use('/user', require('./api/user.js'));
api.use('/family', require('./api/family.js'));

/* End api */

/* apidoc */
app.use('/doc', express.static('doc'));
/* End apidoc*/

/* web client */
app.use(express.static('public'));
app.use('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'public', 'index.html'));
});
/* End web client */

app.listen(port, () => {
    console.log(`Server is up at port ${port}`);
});


