var h = (node, attributes, ...children) => ({node, attributes, children});

var renderVdomNode = vnode => {
  if (typeof vnode === 'string') {
    return document.createTextNode(vnode);
  }

  var $elem;
  var {node, attributes, children} = vnode;

  if (typeof node === 'function') {
    var component = new node(attributes);
    $elem = renderNode(component.render(component.props, component.state));
    component.base = $elem;
  } else if (typeof node === 'string') {
    $elem = document.createElement(node);
    //TODO: if node.attribute, use it. Otherwise, use setAttribute
    Object.entries(attributes).forEach(pair => $elem.setAttribute(...pair));
  }

  if (children) {
    children.forEach($child => $elem.appendChild($child));
  }

  return $elem;
};

//if (node.splitText !== undefined)
//avoid lists of nodes
//avoid extra function calls
//batch DOM updates
//don't read from DOM

//approach
//
//type
//children
//attributes/props
//
//re-render sub-tree if parent changed
//if elements same, compare attributes and update changed
//use keys for lists (or add to unkeyed)
//use NODE_TYPES

var diff = (dom, vnode, parent) => {
  //compare types
  //compare attributes/props
  //compare children
  if (dom) {
    if (typeof vnode === 'string') {
      dom.nodeValue = vnode;
      return dom;
    }

    if (typeof vnode.nodeName === 'function') {
      var component = new vnode.nodename(vnode.attributes);
      var rendered = component.render(component.props, component.state);
      diff(dom, rendered);
      return dom;
    }

    //check if any new children
    //if so, render it with renderNode and append
    if (vnode.children.length !== dom.childNodes.length) {
      dom.appendChild(
        //
        renderNode(vnode.children[vnode.children.length - 1]),
      );
    }

    //diff every child
    dom.childNodes.forEach((child, i) => diff(child, vnode.children[i]));

    //return updated DOM
    return dom;
  } else {
    var newDom = renderNode(vnode);
    parent.appendChild(newDom);
    return newDom;
  }
};

/*
var renderComponent = (component, parent) => {
  var oldBase = component.base;
  component.base = renderNode(
    component.render(component.props, component.state),
  );

  if (parent) {
    parent.appendChild(component.base);
  } else {
    oldBase.parentNode.replaceChild(component.base, oldBase);
  }
};
*/
var renderComponent = component => {
  var rendered = component.render(component.props, component.state);
  component.base = diff(component.base, rendered);
};

class Component {
  constructor(props) {
    this.props = props;
    this.state = {};
  }

  //TODO: sync error with callback?
  setState(state, cb) {
    this.state = Object.assign({}, state);
    cb(this.state);
    renderComponent(this);
  }
}

var render = (vnode, parent) => diff(undefined, vnode, parent);

var currentApp;
var renderApp = (app, state) => {
  var newApp = app(state);

  if (currentApp) {
    document.body.replaceChild(newApp, currentApp);
  } else {
    document.body.appendChild(newApp);
  }

  currentApp = newApp;
};

//now update whenever something happens...
