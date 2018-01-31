import {
  clone,
  compose,
  curry,
  equals,
  has,
  is,
  lensPath,
  mergeDeepRight,
  path,
  set,
  view
} from 'ramda';
import { Either } from '../utils/functional';

/*
Problems with this approach
- Even if we're listening to setStatePaths on a key, if it's set via setState, then the listener won't fire.
- Should I just listen to plain old magic strings?
 */


let _internalState = Object.create(null);
let _listeners     = {onChange: []};

// Convert a string path to an array
const splitKeyPath = keyPath => is(String, keyPath) ? keyPath.split('.') : keyPath;
// Join an array path back together
const joinKeyPath  = keyPath => is(String, keyPath) ? keyPath : keyPath.join('.');

/*
Return a deep clone of the state
 */
export const getState = _ => clone(_internalState);

/*
Return the state structure at a given path.
keyPath may either be an array or a string with '.' separating nested objects
See http://ramdajs.com/docs/#lensPath
 */
// TODO memoize this for performance
export const getStatePath = keyPath => clone(view(lensPath(splitKeyPath(keyPath)), _internalState));

/*
Deeply merges new props in to the state and dispatches a change event
 */
export const setState = val => {
  let newState = mergeDeepRight(_internalState, val);
  if (equals(newState, _internalState)) {
    return false;
  }
  _internalState = newState;
  dispatch();
  return true;
};

/*
Set a nested key in the state and dispatch a change event for that key path
keyPath may either be an array or a string with '.' separating nested objects
See http://ramdajs.com/docs/#set

With currying, fns to set deeply nested structures are easy to create:
let setScore = setStatePath(['user','games',0,'performance','score']);
setScore(100);
 */
export const setStatePath = curry((keyPath, val) => {
  let newState = set(lensPath(splitKeyPath(keyPath)), val, _internalState);
  if (equals(newState, _internalState)) {
    return false;
  }
  _internalState = newState;
  dispatch(joinKeyPath(keyPath));
  return true;
});

/*
Dispatch a change event on the whole state or a specific key listener
 */
const dispatch = keyPath => Either
  .fromBool(keyPath && has(keyPath, _listeners))
  .fold(
    _ => {_listeners.onChange.forEach(fn => fn(getState()));},
    _ => {_listeners[keyPath].forEach(fn => fn(getStatePath(keyPath)));}
  );

/**
 * Listen for a change on a specific key or listen for any change
 * Args listenerFn | keyPath, listenerFn
 */
export const listen = (...args) => {
  let keyPath, fn;

  if (args.length === 2 && is(String, args[0])) {
    keyPath = args[0];
    fn      = args[1];
  } else if (args[0]) {
    keyPath = 'onChange';
    fn      = args[0];
  } else {
    console.warn('Listen called with incorrect args', args);
    return false;
  }

  if (_listeners[keyPath]) {
    _listeners[keyPath].push(fn);
  } else {
    _listeners[keyPath] = [fn];
  }

  // Return fn to remove the listener
  return _ => unlisten(keyPath, fn);
};

/*
Remove a specific listener
 */
const unlisten = (keyPath, fn) => Either
  .fromBool(_listeners[keyPath].indexOf(fn) >= 0)
  .fold(
    _ => {
      console.warn('Can\'t unlisten. Called more than once?');
      return false;
    },
    _ => {
      let idx                  = _listeners[keyPath].indexOf(fn);
      _listeners[keyPath][idx] = null;
      _listeners[keyPath].splice(idx, 1);
      return true;
    }
  );