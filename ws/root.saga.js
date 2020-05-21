//==============================================================================
/*** Dependencies (external, internal, component, local, stubs, under test) ***/

/* External */
import {all, takeEvery} from "redux-saga/effects";

/* Internal */
import {addChannelToStorageSaga, removeChannelToStorageSaga} from "./channelStorage.saga";
import getTranslation from "./getTranslation.saga";
import initializationSaga from "./initialize.saga";
import loginSaga from "./login.saga";
import logoffSaga from "./logoff.saga";
import receiveAskSaga from "./askSaga.saga";
import receiveCurrentRunSaga from "./currentRunSaga.saga";
import receiveLaneChangeSaga from "./laneChangeSaga.saga";
import receiveStartRunSaga from "./startRun.saga";
import receiveVehChangeSaga from "./vehicleChange.saga";
import receiveVehImageSaga from "./vehicleImage.saga";
import receiveVehLocationSaga from "./vehicleLocation.saga";
import sendChangeDealerSaga from "./changeDealer.saga";
import sendUserInfoSaga from "./sendUserInfo.saga";

//==============================================================================

export default function* rootSaga() {
  yield all([
    //APP SETUP
    takeEvery("app::initialize", initializationSaga),
    takeEvery("get::translation", getTranslation),

    //SOCKET INIT
    takeEvery("socket::connect--success", loginSaga),
    takeEvery("socket::logoff", logoffSaga),
    takeEvery("socket::makeSocket", addChannelToStorageSaga),
    takeEvery("socket::destroySocket", removeChannelToStorageSaga),

    //SOCKET SEND
    takeEvery("socket::send--CHGDEALER", sendChangeDealerSaga),
    takeEvery("socket::send--USERINFO", sendUserInfoSaga),

    //SOCKET RECEIVE
    takeEvery("socket::receive--ASK", receiveAskSaga),
    takeEvery("socket::receive--CURRUN", receiveCurrentRunSaga),
    takeEvery("socket::receive--LNECHG", receiveLaneChangeSaga),
    takeEvery("socket::receive--STARTRUN", receiveStartRunSaga),
    takeEvery("socket::receive--VEHCHG", receiveVehChangeSaga),
    takeEvery("socket::receive--VEHIMAGE", receiveVehImageSaga),
    takeEvery("socket::receive--VEHLOC", receiveVehLocationSaga),
  ]);
}
