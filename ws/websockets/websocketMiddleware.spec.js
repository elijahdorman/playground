import makeWebSocketMiddleware from "./websocketMiddleware";
import {TOKEN as token, SOCKET_ID as socketId} from "./websocketMockServer";

const MAKE_SOCKET_ACTION = {type: "socket::makeSocket", meta: {socketId, token}};
const DESTROY_SOCKET_ACTION = {type: "socket::destroySocket", meta: {socketId, token}};
const TEST_ACTION = {type: "socket::test", meta: {socketId, token}};

describe("Websocket Middleware", () => {
  var middleware, store, next, sockets;
  var dispatchAction = action => middleware(store)(next)(action);
  beforeEach(() => {
    sockets = new Map(); //so we can access the sockets in our tests
    middleware = makeWebSocketMiddleware({sockets});
    store = {
      dispatch: jest.fn(),
      getState: () => ({
        environment: {
          urls: {
            websocket: "ws://localhost:3001",
          },
        },
      }),
    };
    next = jest.fn();
  });

  afterEach(() => {
    //clean up websockets
    sockets.forEach(val => val._closeSocket());
  });

  it("ignores any action without 'socket::' type", () => {
    var action = {type: "not a socket message"};
    dispatchAction(action);
    expect(next.mock.calls.length).toBe(1);
    expect(next.mock.calls[0][0].meta).toBeUndefined(); //haven't attached meta.socket
    expect(next.mock.calls[0][0]).toBe(action);
  });

  it("throws error if socket action has no 'meta' or 'meta.socketId'", () => {
    var noMetaAction = {type: "socket::test"};
    expect(() => dispatchAction(noMetaAction)).toThrow();

    var noSocketIdAction = {type: "socket::test"};
    expect(() => dispatchAction(noSocketIdAction)).toThrow();
  });

  it("if action type is 'socket::makeSocket', create new websocket", () => {
    dispatchAction(MAKE_SOCKET_ACTION);
    expect(sockets.has(socketId)).toBe(true);
  });

  it("if action type is 'socket::makeSocket', do nothing if it exists", () => {
    dispatchAction(MAKE_SOCKET_ACTION);
    dispatchAction(MAKE_SOCKET_ACTION);
    expect(next.mock.calls.length).toBe(1); //don't call next second time
    expect(sockets.has(socketId)).toBe(true); //but still create socket
  });

  it("if action is not makeSocket and socket does not exist, throw error", () => {
    expect(() => dispatchAction(TEST_ACTION)).toThrow();
  });

  it("if action type is 'socket::destroySocket', destroy instance and remove from socket store", () => {
    dispatchAction(MAKE_SOCKET_ACTION);
    expect(sockets.has(socketId)).toBe(true);
    var socketInst = sockets.get(socketId); //store so we can check after destroying
    expect(socketInst.getSocketId).toBeTruthy();

    dispatchAction(DESTROY_SOCKET_ACTION);
    expect(sockets.has(socketId)).toBe(false);
    expect(socketInst.getSocketId).toBe(null);
  });

  it("if action type is 'socket::destroySocket', do nothing if socket was already deleted", () => {
    //create
    dispatchAction(MAKE_SOCKET_ACTION);
    expect(sockets.has(socketId)).toBe(true);

    //destroy
    dispatchAction(DESTROY_SOCKET_ACTION);
    expect(sockets.has(socketId)).toBe(false);

    //destroy again
    dispatchAction(DESTROY_SOCKET_ACTION);
    expect(sockets.has(socketId)).toBe(false);
    expect(next.mock.calls.length).toBe(2); //1: make, 2: destroy
  });

  it("all 'socket::' actions add the socket instance to the 'meta'", () => {
    dispatchAction(MAKE_SOCKET_ACTION);
    dispatchAction(TEST_ACTION);

    var socket = sockets.get(socketId);

    expect(next.mock.calls.length).toBe(2);
    expect(next.mock.calls[1][0].meta).toBeDefined();
    expect(next.mock.calls[1][0].meta.socketId).toBe(socketId);
    expect(next.mock.calls[1][0].meta.socket).toBe(socket);
  });
});
