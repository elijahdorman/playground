export var makeWebsocket = ({url, retryInterval = 500}) => {
  var ws = null; //our current websocket instance
  var reconnectAttempts = 0; //how many times we've unsuccessfully tried to reconnect this time
  var isDestroyed = false;

  /******************************************
   **       WEBSOCKET EVENT HANDLERS
   ******************************************/

  var onOpen = e => {
    reconnectAttempts = 0;
  };

  var onMessage = message => {
    console.log(`MessengerApp received message\n`, message);
  };

  var onError = e => {
    console.error("MessengerApp Error", e);
    reconnect();
  };

  var onClose = e => {
    console.warn("MessengerApp closed", e);
    reconnect();
  };

  /******************************************
   **          CONNECTION HELPERS
   ******************************************/

  //connect to websocket
  var connect = () => {
    //this prevents infinite setTimeout loop
    if (isDestroyed || (ws && ws.readyState < 2)) {
      return;
    }

    //create the retry and just abort if we succeed
    setTimeout(connect, reconnectAttempts < 15 ? retryInterval * reconnectAttempts : 1e4);
    reconnectAttempts += 1;

    ws = new WebSocket(url);
    ws.addEventListener("open", onOpen);
    ws.addEventListener("close", onClose);
    ws.addEventListener("message", onMessage);
    ws.addEventListener("error", onError);
  };

  //destroy websocket and attempt to reconnect (if not already connected/reconnecting)
  var reconnect = () => {
    if (ws && ws.readyState > 1) {
      disconnect(ws);
      ws = null;
      connect();
    }
  };

  //remove event listeners
  //spec says they WILL NOT be GC'd if these remain
  var disconnect = socket => {
    socket.removeEventListener("open", onOpen);
    socket.removeEventListener("close", onClose);
    socket.removeEventListener("message", onMessage);
    socket.removeEventListener("error", onError);
  };

  //close and clean up everything to prevent garbage and memory leaks
  var _closeSocket = (code, reason) => {
    isDestroyed = true;
    if (ws) {
      ws.close(code, reason); //close connection
      disconnect(ws);
      onClose({});
      ws = null;
    }

    Object.keys(rtnObj).forEach(key => (rtnObj[key] = null));
  };

  //send string as-is
  var sendRawDataString = rawData => ws.send(rawData);

  //convert object to JSON then send
  var sendData = data => ws.send(JSON.stringify(data));

  var rtnObj = {
    sendRawDataString, // send as raw string
    sendData, // send as JSON
    _closeSocket, // will blow up if called anywhere other than middleware
  };

  setTimeout(connect, 0);

  return rtnObj;
};

export default makeWebsocket;
