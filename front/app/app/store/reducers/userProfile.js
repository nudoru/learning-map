import DefaultState from '../DefaultState';
import * as Actions from '../actions/ActionTypes';

// Action has a type and a payload
export const userProfile = (state = DefaultState.userProfile, action) => {
  switch (action.type) {
    case Actions.SET_FULL_USER_PROFILE:
      return {...action.payload};
    default:
      return state;
  }
};