import createEventEmitter from "./eventEmitter";

describe("eventEmitter", () => {
  var emitter;
  beforeEach(() => {
    emitter = createEventEmitter("foo", "bar");
  });

  it("returns object with getEvents", () => {
    var e = createEventEmitter();
    expect(e.getEvents()).toEqual({"*": []});
  });

  it("takes list of eventNames to setup", () => {
    expect(emitter.getEvents()).toEqual({
      foo: [],
      bar: [],
      "*": [],
    });
  });

  it("can add a new event type", () => {
    emitter.add("baz");
    expect(emitter.getEvents()).toEqual({
      foo: [],
      bar: [],
      baz: [],
      "*": [],
    });
  });

  it("can remove an existing event type", () => {
    emitter.del("bar");
    expect(emitter.getEvents()).toEqual({
      foo: [],
      "*": [],
    });
  });

  it("can add listener to event", () => {
    var a = jest.fn();
    var b = jest.fn();
    var c = jest.fn();
    emitter.on("foo", a);
    emitter.on("foo", b);
    emitter.on("foo", c);

    expect(emitter.getEvents().foo.length).toBe(3);
    expect(emitter.getEvents().foo).toEqual([a, b, c]);
  });

  it("emits event to listeners for event type AND '*' events", () => {
    var a = jest.fn();
    var b = jest.fn();
    var c = jest.fn();
    emitter.on("foo", a);
    emitter.on("foo", b);
    emitter.on(c);

    expect(emitter.getEvents().foo.length).toBe(2);
    expect(emitter.getEvents()["*"].length).toBe(1);

    emitter.emit("foo", "test1", "test2");

    expect(a.mock.calls.length).toBe(1);
    expect(b.mock.calls.length).toBe(1);
    expect(c.mock.calls.length).toBe(1);

    expect(a.mock.calls[0]).toEqual(["test1", "test2"]);
    expect(b.mock.calls[0]).toEqual(["test1", "test2"]);
    expect(c.mock.calls[0]).toEqual(["foo", "test1", "test2"]);
  });

  it("can remove listener from event", () => {
    var a = jest.fn();
    var b = jest.fn();
    var c = jest.fn();
    var unsubA = emitter.on("foo", a);
    var unsubB = emitter.on("foo", b);
    var unsubC = emitter.on("foo", c);

    expect(emitter.getEvents().foo.length).toBe(3);

    unsubA();
    unsubB();
    unsubC();

    expect(emitter.getEvents().foo.length).toBe(0);
  });

  it("only triggers '*' event once when that event is called manually", () => {
    var a = jest.fn();
    emitter.on(a);
    emitter.emit("*", "test1", "test2");

    expect(a.mock.calls[0]).toEqual(["*", "test1", "test2"]);
  });
});
