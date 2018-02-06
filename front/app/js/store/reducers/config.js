import DefaultState from '../DefaultState';
import * as Actions from '../actions/ActionTypes';

// Action has a type and a payload
export const config = (state = DefaultState.config, action) => {
  switch (action.type) {
    case Actions.SET_CONFIG:
      return {...action.payload};
    default:
      return state;
  }
};