// apidoc -- https://apidocjs.com/

const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

var port = process.env.PORT || 22000;
var database = "growingpainslib_test";

process.argv.forEach(arg => {
    if (arg.indexOf("--") === 0) {
        var param = arg.substring(2, arg.indexOf("="));
        var value = arg.substring(arg.indexOf("=") + 1);
        console.log({param}, {value});

        switch(param.toLowerCase()) {
            case "port":
                port = value;
                break;
            case "database":
                database = value;
                break;
        }
    }
});

const bodyparser = require('body-parser');
app.use(bodyparser.json()); // 使用bodyparder中间件，
app.use(bodyparser.urlencoded({ extended: true }));

const cookieParser = require('cookie-parser');
app.use(cookieParser());

console.log = (function(oriLogFunc) {
    return function(req, ...logs) {
        if (req === undefined) {
            oriLogFunc.call(console, ...logs);
        } else if (req.url === undefined) {
            var log = req;
            oriLogFunc.call(console, log, ...logs);
        } else {
            var now = new Date();
            oriLogFunc.call(console, `{${now.toLocaleDateString()} ${now.toTimeString().substring(0, 8)}, ${req.url}} => `, ...logs);
        }
    }
}) (console.log);

/* mysql */
const sqlHelper = require("./dao/sqlHelper");
sqlHelper.init({
    host: "cooljie2000.oicp.net",
    port: "3306",
    database: database,
}, 'kangsj', 'kjy08191211');
/* End mysql */

app.use(cors());

app.use(function(req, res, next) {
    console.log();
    console.log(`[${req.method}] -- ${req.url}`);
    console.log("    params => ", req.query);

    if (req.method === "GET") {
        console.log("    query  => ", req.query);
        // req.params = req.query;
    } else {
        console.log("    body   => ", req.body);
        // req.params = req.body;
    }
    next();
});

if (true) {
/* token 设置与验证 */
const expressJwt = require('express-jwt');
var vertoken = require('./token.js');

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
            error: err.Token
        });
    }
});
} else {
app.use(function(req, res, next) {
    req.user = {
        name: {
            id: 1,
            name: "kangsj"
        }
    };
    next();
});
}
/* End token*/

/* api */

var api = express.Router();
app.use('/api', api);

api.all('/test', function(req, res) {
    familyApi.updateRule(Object.assign(
        req.body,
        req.query,
        req.params,
    ), "test").then(response => {
        res.json({
            date: response
        });
    });
});

var setToken = function(res, token) {
    res.cookie("token", "Bearer " + token, {maxAge: 60 * 1000, httpOnly: true});
}

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

    console.log(req);
    sqlHelper.query(`CALL register_password('${username}', '${password}', @result)`).then(out => {
        console.log(req, {out});
        var result = out[0][0];
        var user = {
            id: result.out_result,
            name: username
        };

        vertoken.setToken(user).then((data)=>{
            setToken(res, data);
            // res.cookie("token", "Bearer " + data);
            res.json({
                data: user,
                token: data
            });
        });
    });
});

/**
 * @api {post} /api/login 用户登录
 * @apiGroup User
 * @apiParam {String} username 用户名称
 * @apiParam {String} password 密码
 */
api.post('/login_password', function(req, res) {
    console.log(req, 'req.body => ', req.body);

    var username = req.body.username;
    var password = req.body.password;

    if (username === undefined || username.isEmpty ||
        password === undefined || password.isEmpty
    ) {
        res.json({token: "login error"});
        return;
    } 

    console.log(req);
    sqlHelper.query(`CALL login_password('${username}', '${password}', @result)`).then(async out => {
        console.log(req, {out});
        var result = out[0][0];
        if (result.out_result > 0) {
            var info = await sqlHelper.query(`
                SELECT * FROM gp_user WHERE id=${result.out_result}
            `);

            sqlHelper.setUserId(result.out_result);
            //生成token
            vertoken.setToken({
                id: result.out_result,
                name: username
            }).then((data)=>{
                setToken(res, data);
                // res.cookie("token", "Bearer " + data);
                res.json({
                    data: info[0],
                    token: data
                });
            });
        } else {
            res.json({error: err.UserOrPassword});
        }
    });
});

const familyApi = require('./api/family.js');
const { response } = require('express');
api.use('/user', require('./api/user.js'));
api.use('/family', familyApi.router);
api.use('/scoring', require('./api/scoring.js'));

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

// app.listen(port, () => {
//     console.log(`Server is up at port ${port}`);
// });

const server = app.listen(port);
server.on('listening', () => {
    console.log(`Server is up at port ${port}`);
});

const duration = 2000; // 重试间隔
var left = 100;
server.on('error', (error) => {
    if (error.code !== 'EADDRINUSE') { // 系统非监听端口操作报错
        throw error;
    }

    left = left - 1;
    // if (showErrMsg) {
    //     console.log(`port ${port} already in use`)
    //     showErrMsg = false
    // }
    console.log(`trying to restart the service on port ${port}... attempts left ${left} `);
    if (left !== 0) {
        setTimeout(() => server.listen(port), duration);
    } else {
        console.log('Server is shutting down');
    }
})
