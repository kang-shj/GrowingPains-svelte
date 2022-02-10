const mysql = require('mysql');

var pool = null;

function init(config, user, password) {
  pool = mysql.createPool(Object.assign(config, {
    user : user,
    password : password,
  }));
}

var userId = 0;
function setUserId(id) {
  userId = id;
} 

function query(sql, notes) {
  return new Promise((resolve, reject) => {
    if (pool !== null) {
      pool.getConnection((err1, connection) => {
        if(err1) {
          console.log(err1);
          reject(err1);
        } else {
          // console.log({connection});

          console.log('sql query => ' + sql);
          connection.query(sql, (err2, result) => {
            if (err2) {
              console.log({err2});
              reject(err2);
            } else {
              console.log({result});
              resolve(result);
            }
            connection.release();
          });

          // 日志
          // try {
          //   journal(connection, userId, sql, notes || "");
          // } catch(e) {
          //   console.log({e});
          // }
        }
      });
    } else {
      console.log({pool});
      reject("pool null");
    }
  });
}

async function journal(connection, userId, sql, notes = "") {
  if (userId === undefined) {
    user = 0;
  }
  var doJournal = function() {
    return new Promise((resolve, reject) => {
      var sql_ = sql.replace(/\'/g, "''");
      connection.query(`CALL addjournal(${userId}, '${sql_}', '${notes}');`, (err) => {
        if (err) {
          console.log({err});
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  await doJournal();
}

module.exports = {
  init: init,
  query: query,
  setUserId: setUserId
};
