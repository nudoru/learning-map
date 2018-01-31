import DefaultState from '../DefaultState';
import * as Actions from '../actions/ActionTypes';

// Action has a type and a payload
export const hydratedContent = (state = DefaultState.hydratedContent, action) => {
  switch (action.type) {
    case Actions.SET_HYDRATEDCONTENT:
      state = action.payload;
      return state;
    default:
      return state;
  }
};