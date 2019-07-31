/* Simple event emitter API
 *
 * createEventEmitter(...eventNames) -- initialize with a list of event names
 *
 * emitter.on(eventName, fn) -> fn   -- subscribe to event. Call returned function to unsubscribe
 * emitter.on(fn) -> fn              -- subscribe to all events. Same as `emitter.on("*", fn)`
 *                                   -- "*" events get an extra first argument containing the event name
 * emitter.add(eventName)            -- will create event if it does not exist
 * emiter.del(eventName)             -- will delete event (and list of listeners)
 * emitter.emit(eventName, ...args)  -- fire off event with given arguments
 * emitter.getEvents() -> Obj        -- get object where key is event name and val is array of listeners
 *                                   -- USE WITH CARE! this is a reference to the real inner object, so
 *                                   -- changing things here will change actual listeners and events.
 */
var createEventEmitter = (...initialEvents) => {
  var events = {'*': []};
  var on = (event, fn) => {
    // slightly hackish solution for when we test some proprietary listeners
    // that don't pass event names, but need some kind of fallback.
    if (typeof event === 'function') {
      events['*'].push(event);
      return () => (events['*'] = events['*'].filter(s => s !== event));
    }

    events[event].push(fn);
    return () => (events[event] = events[event].filter(s => s !== fn));
  };

  var add = event => (events[event] = events[event] || []);
  var del = event => (events[event] = undefined);
  var emit = (event, ...args) => {
    //no repeat if you manually emit the "*" event
    if (event !== '*') {
      events[event].forEach(s => s(...args));
    }
    events['*'].forEach(s => s(event, ...args));
  };

  initialEvents.forEach(e => add(e));

  return {
    on,
    getEvents: () => events,
    add,
    del,
    emit,
  };
};

export default createEventEmitter;
