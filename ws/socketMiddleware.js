// ========================================================================================
import WS from '../utils/websocket'
import { actionCreators } from '../actions/actions';
// ========================================================================================

const createSocketMiddleware = () => {
  const SOCKET_STATES = {
    CONNECTING: 0,
    OPEN: 1,
    CLOSING: 2,
    CLOSED: 3
  }

  let socket = null;
  const pingInterval = 5000;
  let retryInterval = 500;

  return store => next => action => {
    switch (action.type) {
      case 'SOCKET_CONNECT':
        if (socket != null) { socket.close() }
        socket = new WS(store, retryInterval).socket
        if (socket.readyState === SOCKET_STATES.CONNECTING) { retryInterval = retryInterval * 2 }
        break;
      case 'SOCKET_CONNECTED':
        retryInterval = 500
        store.dispatch({ type: 'SOCKET_HEARTBEAT' })
        break;
      case 'SOCKET_CLOSE':
        if (socket != null) { socket.close() }
        socket = null;
        break;
      case 'SOCKET_HEARTBEAT':
        try {
          socket.send('Ping')
        } catch (e) {
          if (!socket) { store.dispatch({ type: 'SOCKET_CONNECT' }) }
        }
        break;
      case 'PONG_RECEIVED':
        setTimeout(() => store.dispatch({ type: 'SOCKET_HEARTBEAT' }), pingInterval)
        break;
      default: //handle all other actions
        if (socket.readyState === SOCKET_STATES.OPEN && action.meta && action.meta.broadcast) {
          socket.send(JSON.stringify(action.body));
        }
        return next(action);
    }
  }
}

export default createSocketMiddleware;
