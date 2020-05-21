var {makeLoginResponse, ERRORS} = require("./loginResponse");

//TODO: if the web server is restarted after the client
//  the client attempts to reconnect, but appears to never
//  get a response and then hangs. This doesn't seem crucial
//  to production and is resolved by refreshing the page, but
//  a fix would be nice for development.
module.exports = function wsReconnectHandler(message, ws, wsManager) {
  var {token, locale, override} = message.attributes;
  if (!token) {
    console.error("Missing token in RECONNECT message");
    ws.send(makeLoginResponse({}, false, ERRORS.invalidLogin));
    ws.close();
  }

  if (!wsManager.allUsers.has(token)) {
    ws.send(makeLoginResponse({}, false, ERRORS.reconnectFailed));
    ws.close();
  }

  var user = wsManager.allUsers.get(token);
  ws.send(makeLoginResponse(user));
};
