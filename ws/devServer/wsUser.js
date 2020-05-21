class User {
  constructor(ws) {
    this.ws = ws;

    this.token = ""; //no token until login
    this.userId = ""; //no userId until token lookup
    this.channelId = ws.channelId;
    this.userType = ws.userType;
    this.locale = "en_US";
    this.loggedIn = false;
  }
}

module.exports = User;
