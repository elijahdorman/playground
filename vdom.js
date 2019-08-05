const EMPTY_OBJECT = {};
const EMPTY_ARRAY = [];
const UNDEFINED = undefined;

const TEXT_NODE = 0;
const DOM_NODE = 1;

var batch;
var patch;
var createNode;

var makeVNode = (
  name,
  attrs,
  children = EMPTY_CHILDREN,
  domNode,
  type,
  key,
) => ({name, attrs, children, domNode, type, key});

var h = (name, attrs = EMPTY_OBJECT, ...childs) => {
  for (var i = 0, children = []; i < childs.length; ++i) {
    if (childs[i] === null) {
      continue;
    } else if (childs[i].name) {
      children.push(childs[i]);
    } else if (typeof childs[i] === 'string') {
      //TODO: check if domNode needs to be changed
      children.push(
        makeVNode(
          childs[i],
          EMPTY_OBJECT,
          UNDEFINED,
          UNDEFINED,
          TEXT_NODE,
          UNDEFINED,
        ),
      );
    }
  }

  //TODO: change how we instantiate functions
  if (typeof name === 'function') {
    return name(attrs, children);
  }
  return makeVNode(name, attrs, children, UNDEFINED, DOM_NODE, attrs.key);
};

var diff = (parent, node, oldVNode, newVNode, listener, isSvg) {
var diff = (parent, node, oldVNode, vNode, isSvg) => {
  if (oldVNode === null) {
    //we are rendering empty -- just skip and render all the things
    return
  }
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
}

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
