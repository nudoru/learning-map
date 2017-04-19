import DefaultState from '../DefaultState';
import * as Actions from '../actions/ActionTypes';

// Action has a type and a payload
export const shadowEnrollments = (state = DefaultState.shadowEnrollments, action) => {
  switch (action.type) {
    case Actions.SET_SHADOW_ENROLLMENTS:
      return {...action.payload};
    default:
      return state;
  }
};