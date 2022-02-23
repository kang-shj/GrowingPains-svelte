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
        reject(error);
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
      username: username,
      password: password
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
    return this.do(comm.get("/api/user/familys"));
  },

  getFamily: function(familyId) {
    return this.do(comm.get(`/api/family/${familyId || ""}`, null));
  },

  createFamily: function(familyName) {
    return this.do(comm.post("/api/family/create", {
      name: familyName
    }));
  },

  getRoles: function() {
    return this.do(comm.get("/api/family/get_roles"));
  },

  addFamilyMember: function(family, user, role, mark) {
    let params = {
      role: role,
      mark: mark
    };

    params = Object.assign(params, typeof family === "number" ? {
      familyId: family
    } : {
      familyName: family.toString()
    });

    params = Object.assign(params, typeof user === "number" ? {
      userId: user
    } : {
      userName: user.toString()
    });

    return this.do(comm.post("/api/family/add_member", params));
  },

  getFamilyMember: function(familyId) {
    return this.do(comm.get("/api/family/get_member", {
      familyId: familyId
    }));
  },

  getFamilyMembers: function(familyId, roleId = 0) {
    return this.do(comm.get("/api/family/get_members", {
      familyId: familyId,
      roleId: roleId
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