export var makeWebsocket = ({dispatch, socketId, url, override = false, retryInterval = 500}) => {
  var queue = [];
  var ws = null; //our current websocket instance
  var reconnectAttempts = 0; //how many times we've unsuccessfully tried to reconnect this time

  var connectionCount = 0; //total login attempts

  var hasLoggedInOnce = false;
  var isDestroyed = false;
  var isLoggedIn = false;
  var isLoggedOff = false;

  /******************************************
   **       WEBSOCKET EVENT HANDLERS
   ******************************************/

  var onOpen = e => {
    reconnectAttempts = 0;
    dispatch([
      {type: "socket::connect--success", payload: e, meta: {socketId}},
      {
        type: `socket::${hasLoggedInOnce ? "relogin" : "login"}`,
        payload: {override},
        meta: {socketId},
      }, // should be "login" or "relogin"
    ]);
  };

  var onMessage = ({data}) => {
    //NOTE: we will error out with non-JSON data
    var message = JSON.parse(data);
    console.log(`websocket ${socketId} received message\n`, message);

    if (message.name === "PING") {
      ws.send(data);
    } else {
      dispatch({type: `socket::receive--${message.name}`, payload: message, meta: {socketId}});
    }
  };

  var onError = e => {
    dispatch({type: "socket::connect--error", payload: e, meta: {socketId}});
    reconnect();
  };

  var onClose = e => {
    dispatch({type: "socket::disconnect", payload: e, meta: {socketId}});
    reconnect();
  };

  /******************************************
   **          CONNECTION HELPERS
   ******************************************/

  //connect to websocket
  var connect = () => {
    //this prevents infinite setTimeout loop
    if (isDestroyed || isLoggedOff || (ws && ws.readyState < 2)) {
      return;
    }

    //create the retry and just abort if we succeed
    setTimeout(connect, reconnectAttempts < 15 ? retryInterval * reconnectAttempts : 3e4);
    reconnectAttempts += 1;
    connectionCount += 1;

    //if first time, leave queue. Otherwise, flush old entries.
    if (hasLoggedInOnce) {
      clearQueue();
    }

    dispatch({type: "socket::connect--pending", meta: {socketId}});

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

  /******************************************
   **           QUEUE AND SEND
   ******************************************/

  //we only queue if we have to.
  var sendQueue = message => (isLoggedIn ? ws.send(message) : queue.push(message));

  //send anything thats built up in the queue
  var doQueue = () => {
    queue.forEach(msg => ws.send(msg));
    clearQueue();
  };

  var clearQueue = () => (queue = []);

  //send string as-is
  var sendRawDataString = rawData => sendQueue(rawData);

  //convert object to JSON then send
  var sendData = data => {
    //login messages bypass queue
    if (data.name === "LOGIN" || data.name === "RELOGIN") {
      ws.send(JSON.stringify(data));
    } else {
      sendQueue(JSON.stringify(data));
    }
  };

  /******************************************
   **          PUBLIC STUFF
   ******************************************/

  //var doQueue = is in queue section
  //var _closeSocket = is in connection helper section

  // we don't use a getter so we can remove all scope references
  var getSocketId = () => socketId;

  var _setLoggedIn = () => {
    hasLoggedInOnce = true;
    isLoggedIn = true;
    doQueue();
  };

  var _setLoggedOff = () => {
    hasLoggedInOnce = false;
    isLoggedOff = true;
  };

  //need explicit object to GC functions
  var rtnObj = {
    sendRawDataString, // add to queue and execute if ready
    sendData, // add to queue and execute if ready
    getSocketId,
    getConnectionCount: () => connectionCount,

    //semi-private stuff --  ONLY for middleware and login sagas
    _closeSocket, // will blow up if called anywhere other than middleware
    _setLoggedIn, //tells the system we're logged in and to run the queue
    _setLoggedOff,
    _setOverride: val => (override = val), //makes future requests override (or not override)
    _resetLoginAttempts: () => (hasLoggedInOnce = false), //will cause login instead of relogin
    //CONSIDER: do we want an explicit _reconnectSocket() to reset data in the future?
  };

  //setup initial connection
  //we're async here so the socketMiddleware has a chance to make the socket instance
  //before any other dispatches happen
  setTimeout(connect, 0);

  return rtnObj;
};

export default makeWebsocket;
