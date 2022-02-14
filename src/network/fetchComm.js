import Comm from './comm'

function comm(url, option) {
  return new Promise((resolve, reject) => {
    var request = Object.assign({
      // mode: 'cors', // no-cors, *cors, same-origin
      // cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
      credentials: 'same-origin', // include, *same-origin, omit
      headers: Object.assign({
        'Content-Type': 'application/json; charset=utf-8',
        // 'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Bearer ' + Comm.token
      }, option.headers || {}),
      // redirect: 'follow', // manual, *follow, error
      // referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
    }, option);
  
    if (request.method === undefined) {
      request["method"] = "GET";
    }
  
    console.log(`[${request.method}] -->> ${url}`, JSON.parse(request.body || "{}")
      , request.headers
    );
    fetch(url, request).then(response => {
      response.json().then(data => {
        console.log(`[${request.method}] <<-- ${url}`, data);
        if (response.ok) {
          resolve(data);
        } else {
          reject(data);
        }
      });
    }).catch(error => {
      console.log({error});
      reject(error);
    });
  });
}

function get(api, data = null, option = {}) {
  let request = Object.assign(option, {
    method: "GET",
  });

  let params = "";
  if (data) {
    params = "?";
    for(let key in data) {
      params = params + key + '=' + data[key] + '&';
    }
  }

  return comm(Comm.Host + api + params, request);
}

function post(api, data = null, option = {}) {
  let request = Object.assign(option, {
    method: "POST",
    body: JSON.stringify(data || {})
  });

  return comm(Comm.Host + api, request);
}

export default {
  comm: comm,
  get: get,
  post: post
};