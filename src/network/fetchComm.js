import Comm from './comm'

function comm(url, option) {
  var request = Object.assign(option, {
    // mode: 'cors', // no-cors, *cors, same-origin
    // cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
    // credentials: 'same-origin', // include, *same-origin, omit
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    	// 'Content-Type': 'application/x-www-form-urlencoded',
    	// 'Authorization': 'Bearer ' + token
    },
    // redirect: 'follow', // manual, *follow, error
    // referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
  });

  if (request.method === undefined) {
    request["method"] = "GET";
  }

  return fetch(url, request).then(
    response => response.json()
  );
}

function get(api, data, option = {}) {
  let request = Object.assign(option, {
    method: "GET",
  });

  let params = "?"
  if (data) {
    for(let key in data) {
      params = params + key + '=' + data[key] + '&';
    }
  }

  return comm(Comm.Host + api + params, request);
}

function post(api, data, option = {}) {
  let request = Object.assign(option, {
    method: "POST",
    body: JSON.stringify(data)
  });

  return comm(Comm.Host + api, request);
}

export default {
  comm: comm,
  get: get,
  post: post
};