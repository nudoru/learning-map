import DefaultState from '../DefaultState';
import * as Actions from '../actions/ActionTypes';

// Action has a type and a payload
export const config = (state = DefaultState.config, action) => {
  switch (action.type) {
    case Actions.SET_CONFIG:
      return {...action.payload};
    case Actions.SET_CURRENT_STRUCTURE:
      state.currentStructure = action.payload;
      return state;
    case Actions.SET_DEFAULT_USER:
      state.defaultuser = action.payload;
      return state;
    case Actions.SET_CONTENT:
      state.content = action.payload;
      return state;
    default:
      return state;
  }
};