import makeWebsocket from "./websockets";
import {SOCKET_ID, makeMockSocketServer, makeMockWebSocket} from "./websocketMockServer";

//TODO: for some of our tests, we connect to a fake websocket URL
//      to test failure. The mock-socket library throws console.error
//      messages about this that look kinda annoying.
//      We should check if there's a way to eliminate them.

/* SETUP 
 * outerScope: make mock server (breaks if in beforeEach)
 * beforeEach: use fake timers before
 * afterEach: clear mocks, switch back to real timers
 * 
 * PROCESS (every test)
 * get socket and dispatch from make mock websocket
 * 
 * call jest.runOnlyPendingTimers() after anything:
 *   1. that touches the mock server
 *   2. that touches the connect setTimeout
 */

describe("Websocket Abstraction Layer", () => {
  var mockServer = makeMockSocketServer();
  var socket, dispatch;

  beforeEach(() => {
    jest.useFakeTimers();

    var socketObj = makeMockWebSocket();
    socket = socketObj.socket; //store in closure
    dispatch = socketObj.dispatch;
    jest.runOnlyPendingTimers();
    jest.runOnlyPendingTimers();

    socket._setLoggedIn();
  });

  afterEach(() => {
    socket._closeSocket();
    jest.runOnlyPendingTimers();

    jest.useRealTimers();
    jest.clearAllMocks();
  });

  it("send pending message after attempting to connect", () => {
    expect(dispatch.mock.calls[0][0]).toMatchObject({
      type: "socket::connect--pending",
      meta: {socketId: SOCKET_ID},
    });
  });

  it("when makeWebSocket is called, it returns a socket instance", () => {
    [
      "sendRawDataString",
      "sendData",
      "getSocketId",
      "_closeSocket",
      "_setLoggedIn",
      "_setLoggedOff",
    ].forEach(key => expect(socket[key]).toBeDefined());
  });

  it("dispatches connect message onOpen", () => {
    expect(dispatch.mock.calls[0][0]).toMatchObject({
      type: "socket::connect--pending",
      meta: {socketId: SOCKET_ID},
    });

    expect(dispatch.mock.calls[1][0][0].type).toBe("socket::connect--success");
    expect(dispatch.mock.calls[1][0][1].type).toBe("socket::login");
  });
  //

  it("dispatches disconnect message onClose", () => {
    //create private socket so we can close it
    var {socket, dispatch} = makeMockWebSocket();
    jest.runOnlyPendingTimers();
    jest.runOnlyPendingTimers();
    socket._closeSocket();

    expect(dispatch.mock.calls[2][0]).toMatchObject({
      type: "socket::disconnect",
      meta: {socketId: SOCKET_ID},
    });
  });

  it("sendRawDataString sends message as given", () => {
    //we send JSON so we don't have to write a ton of mock server code
    var message = '{"name": "SOME_MESSAGE"}';

    socket.sendRawDataString(message);
    jest.runOnlyPendingTimers();

    expect(dispatch.mock.calls[2][0].type).toBe("socket::receive--SOME_MESSAGE");
  });

  it("sendData sends stringified message", () => {
    var message = {name: "SOME_MESSAGE"};

    socket.sendData(message);
    jest.runOnlyPendingTimers();

    expect(dispatch.mock.calls[2][0].type).toBe("socket::receive--SOME_MESSAGE");
  });

  it("dispatches received--name message onMessage with parsed response", () => {
    const message = {name: "MY_MESSAGE"};

    socket.sendData(message);
    jest.runOnlyPendingTimers();

    expect(dispatch.mock.calls[2][0]).toMatchObject({
      type: "socket::receive--MY_MESSAGE",
      payload: message,
      meta: {socketId: SOCKET_ID},
    });
  });

  //NOTE: ping doesn't trigger any externally visible response
  //      instead, the mock server has a specially crafted response
  //      it sends back if it got the ping back

  /* dataflow
   * ws -> MAKE_PING
   * server -> PING
   * ws -> PING
   * server -> PING_RECEIVED
   */
  it("if message is ping, respond immediately and do not dispatch", () => {
    const message = {name: "MAKE_PING"};

    socket.sendData(message);
    jest.runAllTimers();

    expect(dispatch.mock.calls[2][0]).toMatchObject({
      type: "socket::receive--PING_RECEIVED",
      payload: {name: "PING_RECEIVED"},
      meta: {socketId: SOCKET_ID},
    });
  });

  it("if onClose fires without _closeSocket being called, attempt reconnect", () => {
    //mock server directive to close the socket
    //simulating accidental close somewhere
    const message = {name: "MAKE_CLOSE"};

    socket.sendData(message);
    jest.runOnlyPendingTimers(); //disconnect
    jest.runOnlyPendingTimers(); //pending
    jest.runOnlyPendingTimers(); //success

    expect(dispatch.mock.calls[2][0].type).toBe("socket::disconnect");
    expect(dispatch.mock.calls[3][0].type).toBe("socket::connect--pending");
    expect(dispatch.mock.calls[4][0][0].type).toBe("socket::connect--success");
  });

  //NOTE: the mock spawns an error message due to the bad port
  xit("dispatches error message onError", () => {
    // we are causing an error by connecting to a server that doesn't exist
    // (port 3000 instead of 3001)
    var {socket, dispatch} = makeMockWebSocket({url: "ws://localhost:3000"});
    jest.runOnlyPendingTimers();

    expect(dispatch.mock.calls[1][0].type).toBe("socket::connect--error");
    socket._closeSocket();
  });

  //NOTE: the mock spawns an error message due to the bad port
  xit("if error happens, attempt reconnect", () => {
    // we are causing an error by connecting to a server that doesn't exist
    // (port 3000 instead of 3001)
    var {socket, dispatch} = makeMockWebSocket({url: "ws://localhost:3000"});
    jest.runOnlyPendingTimers();

    expect(dispatch.mock.calls[0][0].type).toBe("socket::connect--pending");
    expect(dispatch.mock.calls[1][0].type).toBe("socket::connect--error");
    expect(dispatch.mock.calls[2][0].type).toBe("socket::connect--pending");
    socket._closeSocket();
  });

  //Manually test because there's no good way to run that long
  //it("increase time between reconnects to a maximum of every 30 sec", () => {})

  /* TODO: check against browser sockets manually to see if error occurs
   * at present:
   *    pending
   *    success
   *    disconnect
   *    pending
   *    success
   *    error
   *    disconnect
   *

  it("quit attempting to reconnect if socket is close externally", () => {
    var {socket, dispatch} = makeMockWebSocket();
    jest.runOnlyPendingTimers();
    //mock server directive to close the socket
    //simulating accidental close somewhere
    const message = {name: "MAKE_CLOSE"};
    socket.sendData(message);
    jest.runOnlyPendingTimers();
    // console.log(dispatch.mock.calls);

    jest.runOnlyPendingTimers();
    socket._closeSocket();
    // console.log(dispatch.mock.calls);
    // setTimeout(() => socket._closeSocket(), 1);
    // jest.runOnlyPendingTimers();

    console.log(dispatch.mock.calls);
    // console.log(dispatch.mock.calls[5][0].payload);
    expect(dispatch.mock.calls[2][0].type).toBe("socket::disconnect");
  });
  //  */

  it("sendData sends stringified message", () => {
    var message = {name: "SOME_MESSAGE"};
    socket.sendData(message);
    jest.runOnlyPendingTimers();

    expect(dispatch.mock.calls[2][0].type).toBe("socket::receive--SOME_MESSAGE");
  });

  it("getSocketId returns correct socketId", () => {
    expect(socket.getSocketId()).toBe(SOCKET_ID);
  });

  it("_closeSocket destroys access to socket functions", () => {
    var {socket, dispatch} = makeMockWebSocket();
    jest.runOnlyPendingTimers();
    socket._closeSocket();

    [
      "sendRawDataString",
      "sendData",
      "getSocketId",
      "_closeSocket",
      "_setLoggedIn",
      "_setLoggedOff",
    ].forEach(key => expect(socket[key]).toBe(null));
  });
});
