import DefaultState from '../DefaultState';
import * as Actions from '../actions/ActionTypes';

// Action has a type and a payload
export const userCalendar = (state = DefaultState.userCalendar, action) => {
  switch (action.type) {
    case Actions.SET_USER_CALENDAR:
      return [...action.payload];
    default:
      return state;
  }
};