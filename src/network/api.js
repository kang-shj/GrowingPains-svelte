import comm from './fetchComm'

let token = "";

export default {
  login: function(username, password) {
    return new Promise((resolve, reject) => {
      comm.post("/api/login", {
        username: "kang",
        password: "123456"
      }).then(response => {
        token = response.token;
        resolve(response);
      })
    });
  },
  getUser: function() {
    return comm.get("/api/user/user", null, {
			headers: {
				'Authorization': 'Bearer ' + token
			}
		});
  }
}