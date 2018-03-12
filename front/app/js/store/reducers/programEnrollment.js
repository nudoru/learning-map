import DefaultState from '../DefaultState';
import * as Actions from '../actions/ActionTypes';


export const programEnrollment = (state = DefaultState.programEnrollment, action) => {
    switch (action.type) {
        case Actions.SET_PROGRAM_ENROLLMENT:
            return action.payload;
        default:
            return state;
    }
};