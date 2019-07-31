import {Component, h, createContext} from '../preact.js';
import createEventEmitter from '../utils/eventEmitter.js';

var StoreContext = createContext(null);

class Provider extends Component {
  constructor(props) {
    super(props);

    this.updateContext = this.updateContext.bind(this);
    this.subscription = props.store.subscribe(this.updateContext);
    this.previousState = props.store.getState();

    this.state = {
      store: props.store,
      state: this.previousState,
    };
  }

  componentDidUpdate({store}) {
    if (this.props.store !== store) {
      this.subscription(); //unsub to old store
      this.subscription = props.store.subscribe(this.updateContext);
      this.previousState = props.store.getState();
      this.setState({
        store: this.props.store,
        state: this.previousState,
      });
    }
  }

  componentWillUnmount() {
    this.subscription();
  }

  updateContext(newState) {
    this.setState({state: newState});
  }

  render({children}, {store, state}) {
    return h(StoreContext.Provider, {value: {store, state}}, children);
  }
}

export default Provider;
