import channelReducer from "./channelReducers/channel.reducer";

//each entry here will be the state for the
//individual channel reducer. This will be passed
//into that channel along with the appropriate action
//and the response compared for changes.
var initialState = {};

var channelsReducer = (state = {}, action) => {
  switch (action.type) {
    case "socket::makeSocket":
      //don't make again if we already have it
      return state[action.meta.socketId]
        ? state
        : {
            ...state,
            [action.meta.socketId]: channelReducer(undefined, action), //use undef to get original state
          };

    //CONSIDER: is it faster to Object.assign({}, state) then delete the key?
    case "socket::destroySocket":
      //don't return new object if we already removed
      return !state[action.meta.socketId]
        ? state
        : Object.entries(state).reduce((acc, [id, reducer]) => {
            if (id !== action.meta.socketId) {
              acc[id] = reducer;
            }
            return acc;
          }, {});

    default:
      //we don't know how to handle an action without a socketId
      //CONSIDER: do we need to send with the understanding that it affects everyone?
      if (!(action.meta && action.meta.socketId)) {
        return state;
      }

      //if the reducer is unchanged, return our original state
      //otherwise, we return a new object with the new sub-object
      var reducerResult = channelReducer(state[action.meta.socketId], action);
      return reducerResult === state[action.meta.socketId]
        ? state
        : {
            ...state,
            [action.meta.socketId]: reducerResult,
          };
  }
};

export default channelsReducer;
