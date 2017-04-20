import DefaultState from '../DefaultState';
import * as Actions from '../actions/ActionTypes';

// Action has a type and a payload
export const connectionLMSStatus = (state = DefaultState.connectionLMSStatus, action) => {
  switch (action.type) {
    case Actions.SET_LMS_STATUS:
      return action.payload;
    default:
      return state;
  }
};