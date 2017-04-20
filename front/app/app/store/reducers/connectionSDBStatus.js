import DefaultState from '../DefaultState';
import * as Actions from '../actions/ActionTypes';

// Action has a type and a payload
export const connectionSDBStatus = (state = DefaultState.connectionSDBStatus, action) => {
  switch (action.type) {
    case Actions.SET_SDB_STATUS:
      return action.payload;
    default:
      return state;
  }
};