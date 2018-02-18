import DefaultState from '../DefaultState';
import * as Actions from '../actions/ActionTypes';
import {assignItemToComplete} from '../selectors';

// Action has a type and a payload
export const hydratedContent = (state = DefaultState.hydratedContent, action) => {
    switch (action.type) {
        case Actions.SET_HYDRATEDCONTENT:
            state = action.payload;
            return state;
        case Actions.SUBMIT_ITEM_COMPLETION:
            return assignItemToComplete(state, action.payload);
        default:
            return state;
    }

};