import {Server} from "mock-socket";
import makeWebsocket from "./websockets";

export var SERVER_URL = "ws://localhost:3001";
export var SOCKET_ID = "socket id";
export var TOKEN = "1234567890";

export var makeMockWebSocket = ({url = SERVER_URL} = {}) => {
  var dispatch = jest.fn();
  var socket = makeWebsocket({
    url,
    dispatch,
    socketId: SOCKET_ID,
  });

  return {dispatch, socket};
};

//NOTE: ping doesn't trigger any externally visible response
//      instead, the mock server has a specially crafted response
//      it sends back if it got the ping back

/* dataflow
  * ws -> MAKE_PING
  * server -> PING
  * ws -> PING
  * server -> PING_RECEIVED
  */

export var makeMockSocketServer = (socketId = SOCKET_ID, serverUrl = SERVER_URL) => {
  const mockServer = new Server(serverUrl);

  mockServer.on("connection", socket => {
    //seems like this is what allows the onOpen to fire
    mockServer.emit("connect");

    //subscribe to messages
    socket.on("message", data => {
      var message = JSON.parse(data);
      // console.log("mockSocketServer received data: ", message);

      switch (message.name) {
        case "MAKE_PING":
          socket.send(JSON.stringify({name: "PING"}));
          break;

        case "MAKE_CLOSE":
          socket.close();
          break;

        case "PING":
          socket.send(
            JSON.stringify({
              name: "PING_RECEIVED",
            }),
          );
          break;

        default:
          socket.send(data); //reflect raw
      }
    });
  });

  return mockServer;
};

export default makeMockSocketServer;
