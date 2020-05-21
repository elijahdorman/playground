var User = require("../wsUser");
var {makeLoginResponse, ERRORS} = require("./loginResponse");

var makeLogOffResp = ({token, userType, userId}) =>
  JSON.stringify({
    name: "LOGOFFRESP",
    attributes: {token, userType, userId},
    attachments: [],
  });

module.exports = function wsLoginHandler(message, ws, wsManager) {
  var {token, locale, override} = message.attributes;

  if (!(token && locale)) {
    console.error("Missing token or locale in LOGIN message");
    ws.send(makeLoginResponse({}, false, ERRORS.invalidLogin));
    ws.close();
  }

  var hasUser = wsManager.allUsers.has(token);

  //error, a user's already logged in. Don't override and kill socket
  if (hasUser && !override) {
    console.log("already logged in");
    ws.send(makeLoginResponse({}, false, ERRORS.alreadyLoggedIn));
    //TODO: we close and then blow up
    //  when the client refreshes and attempts to login again
    //  try..catch around close??
    ws.close();
  }

  var user;
  if (!hasUser) {
    user = new User(ws);
    user.token = token;
    user.userId = "user:" + token;
    user.channelId = ws.channelId;
    user.userType = ws.userType;
    ws.token = token;

    wsManager.allUsers.set(token, user);
  } else {
    user = wsManager.allUsers.get(token);
  }

  //handle case where we are the old websocket
  if (override && user.ws !== ws) {
    //logoff then close the other connection
    //then replace the value with our own websocket
    var oldWs = user.ws;
    if (oldWs.readystate < 2) {
      console.log("override different socket");
      oldWs.send(makeLogOffResp(user));
      oldWs.close();
    }
    user.ws = ws;
  }

  //send login response
  user.locale = locale;
  user.loggedIn = true;
  ws.send(makeLoginResponse(user));

  //verify channel format (use server pattern match)
  //supplier  username --> if username then username else userType + "(Anonymous)"
  //track latency
  //  fail if any of these invalid
};
