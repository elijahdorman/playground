//============================= LOCAL IMPORTS ===============================
var wsMessageDispatcher = require("./wsMessageDispatcher");
var User = require("./wsUser");
//===========================================================================

/*
 * This file handles the heartbeat and dispatch of messages
 */

function noop() {}

function setupWebsocket(req, ws, wsManager) {
  if (req.url === "/websockets") {
    ws.channelId = req.channelId;
    ws.userType = req.userType;
    ws.token = "";
  } else if (req.url === "/messenger") {
    ws.token = "MESSENGER_APP";
    ws.isMessengerApp = true;
  }
}

function wsHandler(wsManager) {
  function heartbeat() {
    this.isAlive = true; //set ws.isAlive
  }

  var wsRouteHandler = (ws, req) => {
    setupWebsocket(req, ws, wsManager);
    // console.log("WEBSOCKET REQUEST\n", req);
    ws.on("pong", heartbeat);
    ws.on("message", message => wsMessageDispatcher(message, ws, wsManager));
  };

  wsManager.on("connection", wsRouteHandler);

  //TODO: add custom PING message here
  var interval = setInterval(() => {
    wsManager.clients.forEach(ws => {
      if (ws.isAlive === false) {
        return ws.terminate();
      }

      ws.isAlive = false;
      return ws.ping(noop);
    });
  }, 30000); //heartbeat every 30 sec

  return interval; //so we can cleanup if needed
}

module.exports = wsHandler;
