//naive framework that re-writes DOM on change
//not dis-similar to using templates everywhere
//in the old days...

//hyperscript to DOM
var h = (node, attributes, ...children) => {
  var $elem = document.createElement(node);

  Object.entries(attributes).forEach(pair => $elem.setAttribute(...pair));
  children.forEach(child =>
    $elem.appendChild(
      typeof child === 'string' ? document.createTextNode(child) : child,
    ),
  );

  return $elem;
};

//quick and dirty store.
var makeStore = (state = {}, events = {}) => {
  var subs = [];
  var subscribe = fn => {
    subs.push(fn);
    return () => (subs = subs.filter(x => x !== fn));
  };

  var addEvent = (name, fn) => (events[name] = fn);
  var update = (action, payload) => {
    state = events[action](state, payload);
    subs.forEach(fn => fn(state));
  };

  return {subscribe, update, addEvent};
};

//kick off our app here
var makeApp = ($node, app, store) => {
  var sub = store.subscribe(newState => update(newState));
  var changeState = (action, payload) => store.update(action, payload);

  var app;
  var update = state => {
    var updatedApp = app(state, changeState);
    if (app) {
      $node.replaceChild(updatedApp, app);
    } else {
      $node.appendChild(updatedApp, app);
    }
    app = updatedApp;
  };
};

/*
 *
 *
 *    EXAMPLE
 *
 *
 */

var todoStore = makeStore(
  //state
  {
    todos: [], //{isComplete, text}
    show: 'all', //"all", "completed", or "todo"
  },
  //actions (note: we could be pure and assign a new state)
  {
    addTodo(state, todo) {
      state.todos.push(todo);
    },
    removeTodo(state, index) {
      state.todos.splice(index, 1);
    },
    toggleTodo(state, index) {
      state.todos[index].isComplete = !state.todos[index].isComplete;
    },
    setVisibleTodos(state, visibility) {
      state.show = visibility;
    },
  },
);

var TodoApp = (state, updateStore) =>
  h(
    'div',
    null,
    h(
      'ul',
      {class: 'todos'},
      ...state.todos.map((todo, i) => TodoItem({todo, index}, updateStore)),
    ),
    h(
      'div',
      null,
      h('input', {
        type: 'text',
        placeholder: 'Add Todo',
        value: text,
        oninput: e => updateStore(e.target.value),
      }),
    ),
    h(
      'div',
      {class: 'filters'},
      h('span', {onclick: () => updateStore('setVisibleTodos', 'all')}, 'All'),
      h(
        'span',
        {onclick: () => updateStore('setVisibleTodos', 'completed')},
        'Completed',
      ),
      h(
        'span',
        {onclick: () => updateStore('setVisibleTodos', 'todo')},
        'Todo',
      ),
    ),
  );

var TodoItem = ({todo: {isComplete, text}, index}, updateStore) =>
  h(
    'li',
    null,
    h(
      'label',
      null,
      h('input', {
        type: 'checkbox',
        checked: isCompleted,
        onclick: () => updateStore('toggleTodo', index),
      }),
      text,
    ),
  );

makeApp(document.body, TodoApp, todoStore);
