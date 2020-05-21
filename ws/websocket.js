// ========================================================================================
import { actionCreators } from '../actions/actions';
import { handleEvent } from '../utils/event';
// ========================================================================================

class WS {
  constructor(store, retryInterval) {
    this.socket = new WebSocket('ws://localhost:3001');
    this.socket.onopen    = this.onOpen(store)
    this.socket.onclose   = this.onClose(store)
    this.socket.onmessage = this.onMessage(store)
    this.socket.onerror   = this.onError(store)
    this.retryInterval    = retryInterval
  }

  onOpen = (store) => evt => {
    store.dispatch(actionCreators.socketConnected());
  }

  onClose = (store) => evt => {
    store.dispatch(actionCreators.socketClose());
  }

  onMessage = (store) => evt => {
    try {
      console.log('EVT:', evt)

      const event  = JSON.parse(evt.data)
      // console.log('EVENT', event)
      const action = handleEvent(event)
      // console.log('ACTION', action)
      store.dispatch(action)
    } catch (e) {
      throw('Error Receiving Message Over Websocket Connection: ', e)
    }
  }

  onError = (store) => evt => {
    console.log('ON ERROR', evt)
    const error = Error('Websocket Error')
    console.error('ERROR:', error)
    // while(evt.currentTarget.readyState === 3 && interval < 20000) {
    if (evt.currentTarget.readyState === 3) {
      console.log('ON_ERROR: trying to reconnect')
      setTimeout(() => {
        store.dispatch({ type: 'SOCKET_CONNECT'})
      }, this.retryInterval)
      // interval = interval + 2000
    } else {
      store.dispatch(actionCreators.socketError(error))
    }
  }
}

export default WS