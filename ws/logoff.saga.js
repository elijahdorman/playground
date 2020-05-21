import {put, select} from "redux-saga/effects";

//TODO: add beforePageUnload handler to call this
// when the user closes the page

//TODO: a lane may also close in multilane

export default function* logoffSaga({meta: {socket, socketId}}) {
  var token = yield select(store => store.channelIds.find(x => x.socketId === socketId));

  socket.sendData({
    name: "LOGOFF",
    attributes: {token},
    attachments: [],
  });

  socket._setLoggedOff();

  //CONSIDER: wait for logoff response?
  yield put({
    type: "socket::destroySocket",
    meta: {socketId},
  });
}
