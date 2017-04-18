import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import DefaultReducer from './reducers/default';
import DefaultState from './DefaultState';

// Debugging for Redux-devtools-extension for Chrome
// https://github.com/zalmoxisus/redux-devtools-extension#usage

/* eslint-disable no-underscore-dangle */
const AppStore = createStore(
  DefaultReducer,
  DefaultState,
  applyMiddleware(thunk),
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__());
/* eslint-enable */


export default AppStore;