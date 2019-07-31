export var combineReducers = obj => {
  // the very necessary reducer combiner
  var nextState,
    prevState = {}; //to return same obj if no change
  return (state = {}, action) => {
    var nextState = {},
      isChanged = false;

    Object.entries(obj).forEach(([key, reducer]) => {
      nextState[key] = reducer(state[key], action);
      if (nextState[key] !== prevState[key]) {
        isChanged = true;
      }
    });

    if (isChanged) {
      prevState = nextState;
    }
    return prevState;
  };
};

export var eventEmitter = events => ({
  //simple, but reusable event emitter
  on: (event, fn) => {
    events[event].push(fn);
    return () => (events[event] = events[event].filter(s => s !== fn));
  },
  add: event => (events[event] = events[event] || []),
  del: event => (events[event] = undefined),
  emit: (event, ...args) => events[event].forEach(s => s(...args)),
});

export var createStore = (root, middlewares = [], state) => {
  var getState = () => state;

  middlewares.push(({getState, dispatch}) => next => action => {
    if (typeof action === 'function') {
      return action({dispatch, getState});
    }
    if (Array.isArray(action)) {
      return action.map(a => dispatch(a));
    }
    next(action);
  });

  var update = action => {
    //update state to next version
    state = root(state, action);
    subs.emit('update', state);
  };

  var dispatch = (...x) => dispatch(...x); //to prevent use before define
  dispatch = middlewares //works because one middleware always exists
    .map(mid => mid({getState, dispatch}))
    .reduce((acc, fn) => fn(acc), update);

  var subs = eventEmitter({update: []});
  var subscribe = fn => subs.on('update', fn);

  update({type: '@@init'}); //forces everything to use initial state
  return {subscribe, getState, dispatch};
};

export default createStore;
