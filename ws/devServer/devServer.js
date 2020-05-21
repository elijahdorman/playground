//============================= PACKAGE IMPORTS =============================
var express = require("express");
var http = require("http");
var WebSocket = require("ws");
//============================= LOCAL IMPORTS ===============================
var wsHandler = require("./wsHandler");
var makeRoutes = require("./routes");
//===========================================================================

//CONSIDER: we can setup a websocket client to the laneserver if desired
//CONSIDER: we can use webpack express app

//SETUP EXPRESS SERVER
const app = express();
const server = http.createServer(app);
makeRoutes(app); //setup any routes

//SETUP WEBSOCKET SERVER
const wsserver = http.createServer();
const wsManager = new WebSocket.Server({noServer: true, clientTracking: true});
const intervalId = wsHandler(wsManager); //interval ID to cancel if cleanup needed

//map(<tokenString>,<User>)
wsManager.allUsers = new Map();

//TODO: periodically empty cache.
/*
setInterval(() => {
  wsManager.allUsers.foreach(user => {
    if (user.ws.readyState > 1) {
      wsManager.allUsers.destroy(user.token);
    }
  });
}, 6e5);
*/

//Intercept upgrade calls and slice out the URL params
wsserver.on("upgrade", (req, socket, head) => {
  if (req.url.includes("websockets")) {
    //first two items should be "" then "websockets"
    var [, , /* empty */ /* websockets */ channelId, userType /*maybe empty*/] = req.url.split("/");

    req.url = "/websockets";
    req.channelId = channelId;
    req.userType = userType;

    console.log(`
Connecting to Websocket Client
    ChannelId: ${channelId}
    Usertype: ${userType}
    Url: ${req.url}`);

    wsManager.handleUpgrade(req, socket, head, ws => wsManager.emit("connection", ws, req));
  } else if (req.url.includes("messenger")) {
    console.log(`
Connecting to Websocket Messenger App
    Url: ${req.url}`);
    req.url = "/messenger";

    wsManager.handleUpgrade(req, socket, head, ws => wsManager.emit("connection", ws, req));
  } else {
    socket.destroy();
  }
});

var nodePort = process.env.NODE_PORT || 3002; //8080 is devServer
var wsPort = process.env.WS_PORT || 3001;

app.listen(nodePort, () => {
  console.log(`Express Server started on port ${nodePort} :)`);
});

wsserver.listen(wsPort, () => {
  console.log(`Socket Server started on port ${wsPort} :)`);
});
