import Comm from './comm'
import comm from './fetchComm'

export default {
  setToken: function(token) {
    Comm.token = token;
  },

  do: function(commPromise) {
    return new Promise((resolve, reject) => {
      commPromise.then(response => {
        if (response.token) {
          window.localStorage.setItem("token", response.token);
          this.setToken(response.token);
        }
        resolve(response.data);
      });
    });
  },

  register: function(username, password) {
    return this.do(comm.post("/api/register_password", {
      username: username,
      password: password
    }));
  },

  login: function(username, password) {
    return this.do(comm.post("/api/login_password", {
      username: "kangsj",
      password: "123456"
    }));
  },
  
  getUser: function() {
    return this.do(comm.get("/api/user/user", null));
  },

  getFamily: function() {
    return this.do(comm.get("/api/user/familys", null));
  },

  getRules: function(familyId) {
    return this.do(comm.get("/api/family/get_rules", {
      familyId: familyId
    }));
  },

  addRule: function(familyId, description, scoring) {
    return this.do(comm.post("/api/family/add_rule", {
      familyId: familyId,
      description: description,
      scoring: scoring
    }));
  },

}