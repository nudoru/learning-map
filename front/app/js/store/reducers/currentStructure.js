import DefaultState from '../DefaultState';
import * as Actions from '../actions/ActionTypes';

// Action has a type and a payload
export const currentStructure = (state = DefaultState.currentStructure, action) => {
  switch (action.type) {
    case Actions.SET_CURRENT_STRUCTURE:
      state = action.payload;
      return state;
    default:
      return state;
  }
};