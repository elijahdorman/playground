// ========================================================================================
import {makeWebsocket} from "./websockets";
// ========================================================================================

//if we make multiple stores, we need separate socket maps
//while a map can be passed, this should only be used for testing
var makeWebsocketMiddleware = ({
  defaultUrl = "",
  defaultPort = "",
  defaultBuyerType = "Buyer",
  sockets = new Map(),
}) => store => next => action => {
  var {type, meta, payload} = action;
  //we only care about socket calls (of any kind)
  if (type.startsWith("socket::")) {
    if (!(meta && meta.socketId)) {
      throw Error("'socket::' actions require 'meta.socketId'");
    }

    // check that we either have a socket or are making that socket
    if (type === "socket::makeSocket") {
      if (!meta.token) {
        throw Error("No token provided for socket::makeSocket");
      }

      //bail if already exists
      if (sockets.has(meta.socketId)) {
        return;
      }

      var wsUrl = store.getState().environment.urls.websocket;

      const url = `${wsUrl}/${meta.socketId}/${defaultBuyerType}`;
      console.log(`connecting to ${url}`);

      sockets.set(
        meta.socketId,
        makeWebsocket({
          dispatch: store.dispatch,
          socketId: meta.socketId,
          url,
        }),
      );
      //disconnect socket. If a saga closes a socket, remove entry
    } else if (type === "socket::destroySocket") {
      //bail if already removed
      if (!sockets.has(meta.socketId)) {
        return;
      }

      let socket = sockets.get(meta.socketId);
      socket._closeSocket();
      sockets.delete(meta.socketId);
      //make sure the desired socket is in the socket store
    } else if (!sockets.has(meta.socketId)) {
      throw Error(`socket with id '${meta.socketId}' does not exist`);
    }

    //add socket to the action for the sagas to use
    meta.socket = sockets.get(meta.socketId);
  }

  next(action);
};

export default makeWebsocketMiddleware;
