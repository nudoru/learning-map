import DefaultState from '../DefaultState';
import * as Actions from '../actions/ActionTypes';

// Action has a type and a payload
export const lrsStatements = (state = DefaultState.lrsStatements, action) => {
  switch (action.type) {
    case Actions.SET_LRS_STATEMENTS:
      return [...action.payload];
    default:
      return state;
  }
};