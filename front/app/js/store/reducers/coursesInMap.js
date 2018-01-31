import DefaultState from '../DefaultState';
import * as Actions from '../actions/ActionTypes';

// Action has a type and a payload
export const coursesInMap = (state = DefaultState.coursesInMap, action) => {
  switch (action.type) {
    case Actions.SET_COURSES_IN_MAP:
      return [...action.payload];
    default:
      return state;
  }
};