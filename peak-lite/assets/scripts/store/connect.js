import {Component, h} from '../preact.js';
import createStore from './redux-lite.js';
import rootReducer from './rootReducer.js';

export var store = createStore(rootReducer);

//connect updateFn passes in state and expects an object
//with a subset of the state to be returned
//if updateFn is undefined, we will never prompt an update
export var connect = updateFn => WrappedComponent => {
  class Connect extends Component {
    constructor(props) {
      super(props);

      this.storeUpdated = this.storeUpdated.bind(this);
      this.subscribtion = store.subscribe(this.storeUpdated);
      this.state = store.getState();
    }

    //when we unmount, cancel our subscription
    componentWillUnmount() {
      this.subscription();
    }

    //compare new state object with old state object
    //short-circuit if anything is different
    storeUpdated(newState) {
      if (!updateFn) {
        return;
      }
      var newStateObj = updateFn(newState);
      var newStateList = Object.entries(newStateObj);

      for (var i = 0; i < newStateList.length; ++i) {
        var [key, val] = newStateList[i];
        if (this.state[key] !== val) {
          this.setState(newStateObj);
          break;
        }
      }
    }

    //pass everything through with added-on
    render(props, state) {
      return h(
        WrappedComponent,
        {...state, ...props, dispatch: store.dispatch},
        props.children,
      );
    }
  }

  Connect.displayName = `Connect(${WrappedComponent.displayName ||
    WrappedComponent.name ||
    'Component'})`;

  return Connect;
};

export default connect;
