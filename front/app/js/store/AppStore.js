import { createStore, applyMiddleware, compose } from 'redux';
import logger from 'redux-logger';
import thunk from 'redux-thunk';
import { reducers } from './reducers/index';
import DefaultState from './DefaultState';

// Debugging for Redux-devtools-extension for Chrome
// https://github.com/zalmoxisus/redux-devtools-extension#usage

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose; // eslint-disable-line no-underscore-dangle
//thunk, logger
const AppStore = createStore(
  reducers,
  DefaultState,
  composeEnhancers(applyMiddleware())
);


export default AppStore;