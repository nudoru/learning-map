import DefaultState from '../DefaultState';
import * as Actions from '../actions/ActionTypes';

// Action has a type and a payload
export const allegoStatements = (state = DefaultState.allegoStatements, action) => {
  switch (action.type) {
    case Actions.SET_ALLEGO_STATEMENTS:
      return [...action.payload];
    default:
      return state;
  }
};