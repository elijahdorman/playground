// ========================================================================================
// import { actionCreators } from '../actions/actions';
// ========================================================================================

class WS {
  constructor() {
    this.socket = new WebSocket('ws://localhost:3001/websockets/QLM1_114973_18/Buyer');
    this.socket.onopen    = this.onOpen()
    this.socket.onclose   = this.onClose()
    this.socket.onmessage = this.onMessage()
    this.socket.onerror   = this.onError()
  }

  onOpen = () => evt => {
    this.socket.send(JSON.stringify({
      name: "LOGIN",
      attributes: {
        token: "7366461678",
        locale: "en_US",
        override: false        // only when user selects 'Override' from the popup, then resend this message with true
      },
      attachments: []
    }))
    console.log('SOCKET CONNECTION ACTIVE')
  }

  onClose = () => evt => {
    console.log('CLOSING SOCKET CONNECTION')
  }

  onMessage = () => evt => {
    console.log('SOCKET MESSAGE RECEIVED: ', evt)
  }

  onError = (store) => evt => {
    const error = Error('Websocket Error')
    console.error('ERROR:', error)
  }
}

export default WS