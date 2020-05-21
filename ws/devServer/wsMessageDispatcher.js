//IMPORT HANDLERS HERE
var wsLoginHandler = require("./wsMessageHandlers/login");
var wsReloginHandler = require("./wsMessageHandlers/reconnect");

var wsMessageDispatcher = (message, ws, wsManager) => {
  console.log("\nReceived message:\n", message); //for debugging

  // example: 'ECHO{"type": "MAKE_PING"}'
  // this will bypass any handled cases and
  // return your exact message (minus the leading "ECHO")
  if (message.startsWith("ECHO")) {
    console.log("\nSending ECHO Message:\n", message);
    return ws.send(message.slice(4));
  }

  //The messenger app bypasses normal message handling
  //messages are currently sent to every websocket client
  //except the messenger app.
  //CONSIDER: A ChannelID could be added to the sent messages.
  //  This would then be stripped out and the real message
  //  sent to all clients with a matching channelId
  if (ws.isMessengerApp) {
    console.log("\nSending Messenger App Message:\n", message);
    return wsManager.clients.forEach(ws => {
      if (!ws.isMessengerApp) {
        ws.send(message);
      }
    });
  }

  var finalMessage;
  try {
    finalMessage = JSON.parse(message);
  } catch (e) {
    return console.error(message);
  }

  // console.log("\nws token: ", ws.token);
  //LOGIN **MUST** happen before any other requests
  //NOTE: ECHO requests bypass everything if you need
  if (!ws.token) {
    switch (finalMessage.name) {
      case "LOGIN":
        return wsLoginHandler(finalMessage, ws, wsManager);

      case "RELOGIN":
        return wsReloginHandler(finalMessage, ws, wsManager);

      default:
        return console.log(
          "\nThe following message was rejected because there was no login\n",
          finalMessage,
        );
    }
  }

  switch (finalMessage.name) {
    // Example:
    // case "MYNAME":
    //   return doHandler(finalMessage, ws, wsManager);

    // client can force a ping to happen
    case "MAKE_PING":
      return ws.send(JSON.stringify({name: "PING"}));

    // client can force close (without something like logoff)
    case "MAKE_CLOSE":
      return ws.close();

    // client notified ping received
    case "PING":
      return ws.send(JSON.stringify({name: "PING_RECEIVED"}));

    // unhandled messages are returned "as-is"
    default:
      console.log("\nSending default response\n", message);
      return ws.send(message);
  }
};

module.exports = wsMessageDispatcher;
