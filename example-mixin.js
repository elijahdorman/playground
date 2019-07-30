var mixinClass = mixin => klass =>
  Object.entries(mixin).forEach(([key, val]) => {
    if (klass[key] === undefined) {
      klass[key] = val;
    }
  });

var myMixin = mixinClass({
  foo: 'abc',
  doStuff() {
    console.log('do stuff');
  },
});

var MyClass = myMixin(
  class MyClass {
    constructor(bar) {
      this.bar = bar;
    }
  },
);

