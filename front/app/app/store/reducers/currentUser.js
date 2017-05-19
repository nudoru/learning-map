import DefaultState from '../DefaultState';
import * as Actions from '../actions/ActionTypes';

// Action has a type and a payload
export const currentUser = (state = DefaultState.currentUser, action) => {
  switch (action.type) {
    case Actions.SET_CURRENT_USER:
      return action.payload;
    default:
      return state;
  }
};