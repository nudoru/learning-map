/*
 * Very simple global state object and update event dispatcher
 * Matt Perkins, hello@mattperkins.me
 */

import {merge} from 'lodash';

const createStateStore = () => {

  let _internalState = Object.create(null),
      _listeners     = {};

  /**
   * Return a copy of the state
   */
  const dangerousGetState = () => {
    return Object.assign({}, _internalState);
  };

  /**
   * Sets the state
   * @param nextState
   */
  const dangerousSetState = (nextState) => {
    _internalState = merge({}, _internalState, nextState);
    _dispatch();
  };

  /**
   * Register a listener function to an id
   * @param id
   * @param func
   */
  const dangerousSubscribe = (id, func) => {
    _listeners[id] = func;
  };

  /**
   * Unregister a listener function
   * @param id
   */
  const dangerousUnsubscribe = (id) => {
    if (_listeners.hasOwnProperty(id)) {
      delete _listeners[id];
    } else {
      console.warn('State has no listeners for', id);
    }
  };

  /**
   * Call each registered listener function
   */
  const _dispatch = () => {
    Object.keys(_listeners).forEach(id => _listeners[id].call(null, dangerousGetState()));
  };

  return {dangerousSetState, dangerousGetState, dangerousSubscribe, dangerousUnsubscribe}

};

const AppState = createStateStore();

export default AppState;