import {select, take, put} from "redux-saga/effects";

const ALREADY_LOGGED_IN = 400;
const RECONNECT_FAILED = 450;
const INVALID_LOGIN = 500;
const SERVER_LOST = 600;
const SERVER_UNREACHABLE = 700;
const UNKNOWN_ERROR = 800;
const FIREWALL_ERROR = 900;

const LOGIN = "socket::login";
const RELOGIN = "socket::relogin";
const LOGINRESP = "socket::receive--LOGINRESP";

export default function* loginSaga(action) {
  //loop and wait for a login prompt from the websocket abstraction layer
  while (true) {
    var {
      meta: {socket, socketId},
      type,
    } = yield take([LOGIN, RELOGIN]);
    var store = yield select();
    var locale = store.user.locale;
    // linter errors because we have a function inside a loop
    // disabled because nothing survives the loop
    // eslint-disable-next-line
    var {token} = store.channelIds.find(x => x.socketId === socketId);

    if (type === LOGIN) {
      socket.sendData({
        name: "LOGIN",
        attributes: {
          token,
          locale,
          //TODO: fix override
          // override: false,
          override: window.override || false,
        },
        attachments: [],
      });
    } else {
      socket.sendData({
        name: "RECONNECT",
        attributes: {token},
        attachments: [],
      });
    }

    //loop and wait for LOGINRESP
    while (true) {
      //NOTE: there is a potential case where the connection fails while waiting
      //      the solution is probably a timeout. Only a partial issue because any
      //      other reconnect on the same lane will trigger this. That will force
      //      two setLoggedIn() or two error handlers, but seems mostly harmless.
      var resp = yield take(LOGINRESP);
      var {
        meta,
        payload: {attributes},
      } = resp;

      console.log("got login response", resp);
      //wait until the response for our socket comes around
      if (meta.socketId === socketId) {
        if (attributes.valid) {
          socket._setLoggedIn();
          yield put({type: "socket::send--USERINFO", meta: {socketId}});
        } else {
          switch (attributes.errorCode) {
            case ALREADY_LOGGED_IN:
              //TODO: make this do something in the UI -- a different card
              //      use the override: true property if the user says yes
              socket._setOverride(true); //force override by default
              console.error("already logged in");
              break;

            case INVALID_LOGIN:
              //TODO: find out why and if we can fix -- a different card
              console.error("invalid login");
              //CONSIDER: should everything from here down be a default case

              break;
            case RECONNECT_FAILED:
              socket._resetReconnectAttempts();
              break;

            //reset to normal login
            case SERVER_LOST:
            case SERVER_UNREACHABLE:
            case UNKNOWN_ERROR:
            case FIREWALL_ERROR:
              //TODO: elegantly inform the user of this -- a different card
              console.error("unrecoverable error -- probably in the server");
              break;

            default:
              //TODO: how to handle unexpected login errors -- a different card
              console.error("We have no idea what happened here");
          }
        }
        break;
      }
    }
  }
}
