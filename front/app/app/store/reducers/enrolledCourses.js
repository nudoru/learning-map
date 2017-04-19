import DefaultState from '../DefaultState';
import * as Actions from '../actions/ActionTypes';

// Action has a type and a payload
export const enrolledCourses = (state = DefaultState.enrolledCourses, action) => {
  switch (action.type) {
    case Actions.SET_ENROLLED_COURSES:
      return [...action.payload];
    default:
      return state;
  }
};