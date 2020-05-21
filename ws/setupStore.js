import {createStore, applyMiddleware, compose} from "redux";
import thunk from "redux-thunk";
import createSagaMiddleware from "redux-saga";
import {composeWithDevTools} from "redux-devtools-extension";

import rootReducer from "./reducers/root.reducer";
import rootSaga from "./sagas/root.saga";
import makeWebsocketMiddleware from "../utils/websockets/websocketMiddleware";

var multipleDispatch = ({dispatch}) => next => action =>
  Array.isArray(action) ? action.forEach(dispatch) : next(action);

var setupStore = () => {
  const sagaMiddleware = createSagaMiddleware();

  //TODO: this shouldn't be in client-facing code
  //TODO: move this to a config block in the index.html and deliver
  //      a different index.html for dev environment
  //TODO: make .pug page to serve

  var socketMiddleware = makeWebsocketMiddleware({
    defaultUrl: "sim-dc1qa2-lane01.imanheim.com",
    defaultPort: "1703",
    defaultBuyerType: "Buyer",
  });

  var middlewares = applyMiddleware(multipleDispatch, thunk, socketMiddleware, sagaMiddleware);

  var store = process.env.NODE_ENV.endsWith("production")
    ? createStore(rootReducer, middlewares)
    : createStore(rootReducer, composeWithDevTools(middlewares));

  sagaMiddleware.run(rootSaga);

  return store;
};

export default setupStore;
