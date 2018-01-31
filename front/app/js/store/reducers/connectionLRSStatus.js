import DefaultState from '../DefaultState';
import * as Actions from '../actions/ActionTypes';

// Action has a type and a payload
export const connectionLRSStatus = (state = DefaultState.connectionLRSStatus, action) => {
  switch (action.type) {
    case Actions.SET_LRS_STATUS:
      return action.payload;
    default:
      return state;
  }
};