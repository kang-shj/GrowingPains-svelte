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
      }).catch(error => {
        // TODO: show error dialog
        console.log("TODO: show error dialog");
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
    return this.do(comm.get("/api/user/", null));
  },

  linkFamily: function(familyId) {
    return this.do(comm.post("/api/user/link_family", {
      familyId: familyId
    }));
  },

  getFamilyLink: function() {
    return this.do(comm.get("/api/user/family_link", null));
  },

  getFamilys: function() {
    return this.do(comm.get("/api/user/familys", null));
  },

  getFamily: function(familyId) {
    return this.do(comm.get(`/api/family/${familyId}`, null));
  },

  createFamily: function(familyName) {
    return this.do(comm.post("/api/family/create", {
      name: familyName
    }));
  },

  addFamilyMember: function(familyId, userId, role, mark) {
    return this.do(comm.post("/api/family/add_member", {
      familyId: familyId,
      userId: userId,
      role: role,
      mark: mark
    }));
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