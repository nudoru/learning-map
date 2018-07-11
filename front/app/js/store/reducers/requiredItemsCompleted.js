import DefaultState from '../DefaultState';
import * as Actions from '../actions/ActionTypes';

// Action has a type and a payload
export const requiredItemsCompleted = (state = DefaultState.requiredItemsCompleted, action) => {
    switch (action.type) {
        case Actions.MARK_COURSE_COMPLETION:
            state = action.payload;
            return state;
        default:
            return state;
    }
};