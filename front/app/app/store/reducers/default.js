import {combineReducers} from 'redux';

import DefaultState from '../DefaultState';
import * as ACTIONS from '../actions/Actions';

const config = (config = DefaultState.config, action) => {
  switch (action.type) {
    case ACTIONS.SET_CONFIG:
      return {...action.config};
  }
  return config;
};

const DefaultReducer = combineReducers({config});

export default DefaultReducer;