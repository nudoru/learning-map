import * as Actions from './ActionTypes';

export const setConfig = (payload) => ({
    type: Actions.SET_CONFIG,
    payload
  });

export const setCurrentUser = (payload) => ({
    type: Actions.SET_CURRENT_USER,
    payload
  });

export const setHydratedContent = (payload) => ({
    type: Actions.SET_HYDRATEDCONTENT,
    payload
  });

export const setCurrentStructure = (payload) => ({
    type: Actions.SET_CURRENT_STRUCTURE,
    payload
  });

export const setLRSStatements = (payload) => ({
    type: Actions.SET_LRS_STATEMENTS,
    payload
  });

export const setAllegoStatements = (payload) => ({
  type: Actions.SET_ALLEGO_STATEMENTS,
  payload
});

export const setShadowEnrollments = (payload) => ({
    type: Actions.SET_SHADOW_ENROLLMENTS,
    payload
  });

export const setFullUserProfile = (payload) => ({
    type: Actions.SET_FULL_USER_PROFILE,
    payload
  });

export const setCoursesInMap = (payload) => ({
    type: Actions.SET_COURSES_IN_MAP,
    payload
  });

export const setLMSStatus = (payload) => ({
  type: Actions.SET_LMS_STATUS,
  payload
});

export const setLRSStatus = (payload) => ({
  type: Actions.SET_LRS_STATUS,
  payload
});

export const setSDBStatus = (payload) => ({
  type: Actions.SET_SDB_STATUS,
  payload
});

export const submitCompletion = (payload) => ({
    type: Actions.SUBMIT_ITEM_COMPLETION,
    payload
});

export const setProgramEnrollment = (payload) => ({
    type: Actions.SET_PROGRAM_ENROLLMENT,
    payload
});

