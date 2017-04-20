import DefaultState from '../DefaultState';
import * as Actions from '../actions/ActionTypes';

// Action has a type and a payload
export const connectionAllegoStatus = (state = DefaultState.connectionAllegoStatus, action) => {
  switch (action.type) {
    case Actions.SET_ALLEGO_STATUS:
      return action.payload;
    default:
      return state;
  }
};